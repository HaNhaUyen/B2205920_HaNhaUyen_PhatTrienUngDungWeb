const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("theodoimuonsach");
    this.Book = client.db().collection("sach");
    // ✅ Thêm collection Người dùng để xử lý khóa/mở khóa
    this.User = client.db().collection("nguoidung");
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
      // Các trường mới cho xử lý sự cố
      loai_su_co: payload.loai_su_co || null, // 'mat_sach', 'hu_hong'
      phuong_an_den_bu: payload.phuong_an_den_bu || null, // 'tu_mua', 'den_tien'
      phi_den_bu: payload.phi_den_bu || 0,
      han_xu_ly: payload.han_xu_ly || null, // Deadline phản hồi
      ngay_bao_cao: payload.ngay_bao_cao || null,
    };

    Object.keys(borrow).forEach(
      (key) => borrow[key] === undefined && delete borrow[key]
    );
    return borrow;
  }

  async restoreBookQuantity(bookId, qty) {
    const quantityNumber = parseInt(qty) || 1;
    return await this.Book.updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { so_luong: quantityNumber } }
    );
  }

  async create(payload) {
    const borrow = this.extractBorrowData(payload);

    // Kiểm tra user có đang bị khóa không
    const user = await this.User.findOne({
      _id: new ObjectId(borrow.ma_doc_gia),
    });
    if (user && user.bi_khoa) {
      throw new Error(
        "Tài khoản đang bị khóa do vi phạm/mất sách. Vui lòng giải quyết sự cố trước."
      );
    }

    const book = await this.Book.findOne({ _id: new ObjectId(borrow.ma_sach) });
    if (!book) throw new Error("Không tìm thấy sách");

    const requestedQuantity = borrow.so_luong || 1;
    if (book.so_luong < requestedQuantity) {
      throw new Error(
        `Sách chỉ còn ${book.so_luong} bản, không đủ số lượng yêu cầu`
      );
    }

    const result = await this.Borrow.insertOne(borrow);
    await this.Book.updateOne(
      { _id: book._id },
      { $inc: { so_luong: -requestedQuantity } }
    );
    return result;
  }

  async find(filter) {
    const pipeline = [
      { $match: filter },
      { $addFields: { bookObjectId: { $toObjectId: "$ma_sach" } } },
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
          // Field hiển thị thêm
          loai_su_co: 1,
          phuong_an_den_bu: 1,
          phi_den_bu: 1,
          han_xu_ly: 1,
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
          loai_su_co: 1,
          phuong_an_den_bu: 1,
          phi_den_bu: 1,
          "docgia._id": 1,
          "docgia.ho_ten": 1,
          "docgia.email": 1,
          "docgia.bi_khoa": 1, // Để biết trạng thái user
          "sach._id": 1,
          "sach.ten_sach": 1,
          "sach.don_gia": 1, // Cần giá để tính đền bù
        },
      },
    ];
    return await this.Borrow.aggregate(pipeline).toArray();
  }

  async returnBook(id, ngay_tra_thuc_te = new Date()) {
    const borrow = await this.findById(id);
    if (!borrow) return null;
    if (borrow.trang_thai === "returned" || borrow.trang_thai === "da_xu_ly") {
      return borrow;
    }

    const due = new Date(borrow.han_tra);
    const returned = new Date(ngay_tra_thuc_te);

    let fine = 0;
    if (returned > due) {
      const lateDays = Math.ceil((returned - due) / (1000 * 60 * 60 * 24));
      fine = lateDays * 5000;
    }

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

    await this.restoreBookQuantity(borrow.ma_sach, borrow.so_luong || 1);
    return result;
  }

  async update(id, payload) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
    return await this.Borrow.findOneAndUpdate(
      filter,
      { $set: payload },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    const borrow = await this.Borrow.findOne({ _id: new ObjectId(id) });
    if (!borrow) return null;

    if (borrow.trang_thai === "pending" || borrow.trang_thai === "borrowing") {
      await this.restoreBookQuantity(
        borrow.ma_sach,
        parseInt(borrow.so_luong) || 1
      );
    }
    return await this.Borrow.findOneAndDelete({ _id: new ObjectId(id) });
  }

  async deleteAll() {
    const result = await this.Borrow.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Borrow.find({}).toArray();
  }

  // =========================================================
  // ✅ TÍNH NĂNG MỚI: BÁO CÁO SỰ CỐ & ĐỀN BÙ
  // =========================================================

  /**
   * 1. User báo cáo mất/hư sách
   * - Cập nhật trạng thái phiếu mượn.
   * - Khóa tài khoản User ngay lập tức.
   * - Đặt hạn xử lý 14 ngày.
   */
  async reportIssue(id, payload) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Không tìm thấy phiếu mượn");

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14); // Hạn 14 ngày

    // Cập nhật phiếu mượn
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          trang_thai: "gap_su_co",
          loai_su_co: payload.loai_su_co, // 'mat_sach', 'hu_hong'
          ngay_bao_cao: new Date(),
          han_xu_ly: deadline,
          // Reset các phương án cũ nếu có
          phuong_an_den_bu: null,
          phi_den_bu: 0,
        },
      },
      { returnDocument: "after" }
    );

    // 🔒 KHÓA TÀI KHOẢN USER
    await this.User.updateOne(
      { _id: new ObjectId(borrow.ma_doc_gia) },
      { $set: { bi_khoa: true } }
    );

    return result;
  }

  /**
   * 2. User chọn phương án đền bù
   * - 'tu_mua': Tự mua sách trả lại.
   * - 'den_tien': Đền tiền (Giá sách + Phí xử lý).
   */
  async updateCompensationMethod(id, method) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Không tìm thấy phiếu mượn");

    let updateData = {
      phuong_an_den_bu: method,
    };

    // Nếu chọn đền tiền, tính toán chi phí
    if (method === "den_tien") {
      const book = await this.Book.findOne({
        _id: new ObjectId(borrow.ma_sach),
      });
      const bookPrice = book.don_gia || 0;
      const processingFee = 20000; // Phí xử lý ví dụ 20k
      // Giá * số lượng + phí
      updateData.phi_den_bu =
        bookPrice * (borrow.so_luong || 1) + processingFee;
    } else {
      updateData.phi_den_bu = 0;
    }

    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );
    return result;
  }

  /**
   * 3. (Cron Job/Admin Trigger) Quét các đơn quá hạn xử lý (14 ngày)
   * - Nếu chưa chọn phương án -> Mặc định là 'den_tien'
   */
  async autoProcessOverdueIssues() {
    const now = new Date();
    const borrowsToUpdate = await this.Borrow.find({
      trang_thai: "gap_su_co",
      phuong_an_den_bu: null, // Chưa chọn phương án
      han_xu_ly: { $lt: now }, // Đã quá hạn
    }).toArray();

    let count = 0;
    for (const borrow of borrowsToUpdate) {
      // Mặc định chuyển sang đền tiền
      await this.updateCompensationMethod(borrow._id, "den_tien");
      count++;
    }
    return count;
  }

  /**
   * 4. Admin xác nhận hoàn tất (Đã nhận sách hoặc tiền)
   * - Đóng hồ sơ ('da_xu_ly').
   * - Nếu là 'tu_mua' (trả sách mới) -> Cộng lại kho.
   * - Kiểm tra user còn nợ đơn nào khác không? Nếu không -> Mở khóa.
   */
  async completeCompensation(id, adminNote = "") {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Không tìm thấy phiếu mượn");

    // Cập nhật trạng thái
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          trang_thai: "da_xu_ly", // Đã khép vụ
          ghi_chu_admin: adminNote,
          ngay_tra_thuc_te: new Date(), // Ghi nhận ngày giải quyết xong
        },
      },
      { returnDocument: "after" }
    );

    // LOGIC KHO SÁCH:
    // Nếu user mua sách mới trả -> Thư viện nhận lại sách -> Tăng kho
    // Nếu user đền tiền -> Sách cũ mất/hư -> KHÔNG tăng kho (coi như mất luôn)
    if (borrow.phuong_an_den_bu === "tu_mua") {
      await this.restoreBookQuantity(borrow.ma_sach, borrow.so_luong || 1);
    }

    // LOGIC MỞ KHÓA USER:
    // Kiểm tra xem user này còn phiếu nào đang "gap_su_co" hay không
    const pendingIssues = await this.Borrow.countDocuments({
      ma_doc_gia: borrow.ma_doc_gia,
      trang_thai: "gap_su_co",
    });

    // Nếu không còn sự cố nào khác -> Mở khóa
    if (pendingIssues === 0) {
      await this.User.updateOne(
        { _id: new ObjectId(borrow.ma_doc_gia) },
        { $set: { bi_khoa: false } }
      );
    }

    return result;
  }
}

module.exports = BorrowService;
