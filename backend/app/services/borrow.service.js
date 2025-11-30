const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("theodoimuonsach");
    this.Book = client.db().collection("sach");
  }

  extractBorrowData(payload) {
    const borrow = {
      ma_doc_gia: payload.ma_doc_gia,
      ma_sach: payload.ma_sach,
      ngay_muon: payload.ngay_muon || new Date(),
      han_tra: payload.han_tra,
      ngay_tra_thuc_te: payload.ngay_tra_thuc_te || null,
      tien_phat: payload.tien_phat || 0,
      trang_thai: payload.trang_thai || "pending",
      so_luong: parseInt(payload.so_luong) || 1,
    };

    Object.keys(borrow).forEach(
      (key) => borrow[key] === undefined && delete borrow[key]
    );
    return borrow;
  }

  // ✅ HÀM MỚI: Tăng lại số lượng sách
  async restoreBookQuantity(bookId, qty) {
    // Ép kiểu qty thành số nguyên, nếu lỗi thì mặc định là 1
    const quantityNumber = parseInt(qty) || 1;

    return await this.Book.updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { so_luong: quantityNumber } } // Truyền số đã ép kiểu vào đây
    );
  }

  async create(payload) {
    const borrow = this.extractBorrowData(payload);

    const book = await this.Book.findOne({ _id: new ObjectId(borrow.ma_sach) });
    if (!book) throw new Error("Không tìm thấy sách");

    const requestedQuantity = borrow.so_luong || 1;

    if (book.so_luong < requestedQuantity) {
      throw new Error(
        `Sách chỉ còn ${book.so_luong} bản, không đủ số lượng yêu cầu (${requestedQuantity})`
      );
    }

    const result = await this.Borrow.insertOne(borrow);

    // Trừ số lượng sách khi tạo phiếu mượn
    await this.Book.updateOne(
      { _id: book._id },
      { $inc: { so_luong: -requestedQuantity } }
    );

    return result;
  }

  async find(filter) {
    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          bookObjectId: { $toObjectId: "$ma_sach" },
        },
      },
      {
        $lookup: {
          from: "sach",
          localField: "bookObjectId",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: 1,
          ma_doc_gia: 1,
          ma_sach: 1,
          so_luong: 1,
          ngay_muon: 1,
          han_tra: 1,
          ngay_tra_thuc_te: 1,
          trang_thai: 1,
          tien_phat: 1,
          book: 1,
        },
      },
    ];

    const cursor = await this.Borrow.aggregate(pipeline);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Borrow.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findWithDetails(filter = {}) {
    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          userId: { $toObjectId: "$ma_doc_gia" },
          bookId: { $toObjectId: "$ma_sach" },
        },
      },
      {
        $lookup: {
          from: "nguoidung",
          localField: "userId",
          foreignField: "_id",
          as: "docgia",
        },
      },
      { $unwind: "$docgia" },
      {
        $lookup: {
          from: "sach",
          localField: "bookId",
          foreignField: "_id",
          as: "sach",
        },
      },
      { $unwind: "$sach" },
      {
        $project: {
          _id: 1,
          ngay_muon: 1,
          han_tra: 1,
          ngay_tra_thuc_te: 1,
          so_luong: 1,
          tien_phat: 1,
          trang_thai: 1,
          "docgia._id": 1,
          "docgia.ho_ten": 1,
          "docgia.email": 1,
          "sach._id": 1,
          "sach.ten_sach": 1,
        },
      },
    ];

    return await this.Borrow.aggregate(pipeline).toArray();
  }

  // ✅ CẬP NHẬT: Xử lý trả sách và cộng lại kho
  async returnBook(id, ngay_tra_thuc_te = new Date()) {
    const borrow = await this.findById(id);
    if (!borrow) return null;

    // Nếu đã trả rồi thì không xử lý nữa để tránh cộng dồn kho sai
    if (borrow.trang_thai === "returned") {
      return borrow;
    }

    const due = new Date(borrow.han_tra);
    const returned = new Date(ngay_tra_thuc_te);

    let fine = 0;
    if (returned > due) {
      const lateDays = Math.ceil((returned - due) / (1000 * 60 * 60 * 24));
      fine = lateDays * 1000; // Ví dụ phạt 1000đ, hoặc logic 5000đ tùy bạn
    }

    // Cập nhật trạng thái phiếu mượn
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ngay_tra_thuc_te: returned,
          tien_phat: fine,
          trang_thai: "returned",
        },
      },
      { returnDocument: "after" }
    );

    // ✅ Tăng lại số lượng sách trong kho
    await this.restoreBookQuantity(borrow.ma_sach, borrow.so_luong || 1);

    return result;
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    return await this.Borrow.findOneAndUpdate(
      filter,
      { $set: payload },
      { returnDocument: "after" }
    );
  }

  // ✅ CẬP NHẬT: Xử lý khi xóa (Hủy mượn) thì cộng lại kho
  async delete(id) {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const borrow = await this.Borrow.findOne({ _id: new ObjectId(id) });
    if (!borrow) return null;

    if (borrow.trang_thai === "pending" || borrow.trang_thai === "borrowing") {
      // ✅ Ép kiểu ở đây cho chắc chắn trước khi truyền đi
      const qtyToRestore = parseInt(borrow.so_luong) || 1;

      await this.restoreBookQuantity(borrow.ma_sach, qtyToRestore);
    }

    return await this.Borrow.findOneAndDelete({
      _id: new ObjectId(id),
    });
  }

  async deleteAll() {
    const result = await this.Borrow.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Borrow.find({}).toArray();
  }
}

module.exports = BorrowService;
