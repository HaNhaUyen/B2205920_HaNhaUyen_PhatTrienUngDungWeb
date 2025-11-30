const { ObjectId } = require("mongodb");

class CommentService {
  constructor(client) {
    this.Comment = client.db().collection("danhgia"); // Tên collection là 'comments'
  }

  extractCommentData(payload) {
    const comment = {
      ma_doc_gia: payload.ma_doc_gia,
      ma_sach: payload.ma_sach,
      noi_dung: payload.noi_dung,
      ti_le: payload.ti_le || 5,
      ngay_tao: payload.ngay_tao || new Date(),
    };

    // Xóa các trường undefined
    Object.keys(comment).forEach(
      (key) => comment[key] === undefined && delete comment[key]
    );

    return comment;
  }

  async create(payload) {
    const comment = this.extractCommentData(payload);
    const result = await this.Comment.insertOne(comment);
    return result.ops ? result.ops[0] : comment;
  }

  async find(filter) {
    const cursor = await this.Comment.find(filter);
    return await cursor.toArray();
  }

  async findByBookId(bookId) {
    const comments = await this.Comment.aggregate([
      {
        $match: {
          ma_sach: bookId, // vì là string nên giữ nguyên
        },
      },
      {
        $addFields: {
          ma_doc_gia: { $toObjectId: "$ma_doc_gia" },
        },
      },
      {
        $lookup: {
          from: "nguoidung",
          localField: "ma_doc_gia",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          noi_dung: 1,
          ngay_tao: 1,
          ti_le: 1,
          "user.ho_ten": 1,
          "user._id": 1,
        },
      },
    ]).toArray();

    return comments;
  }

  async findByUserId(userId) {
    const comments = await this.Comment.aggregate([
      {
        $match: { ma_doc_gia: userId }, // userId là string, không cần chuyển đổi
      },
      {
        $addFields: {
          bookId: { $toObjectId: "$ma_sach" },
        },
      },
      {
        $lookup: {
          from: "sach",
          localField: "bookId",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $project: {
          noi_dung: 1,
          ngay_tao: 1,
          ti_le: 1,
          ten_sach: "$book.ten_sach",
        },
      },
    ]).toArray();

    return comments;
  }

  async findById(id) {
    return await this.Comment.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractCommentData(payload);
    const result = await this.Comment.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    return await this.Comment.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async deleteAll() {
    const result = await this.Comment.deleteMany({});
    return result.deletedCount;
  }

  // Trong file services/comment.service.js

  async findAll() {
    const pipeline = [
      {
        $addFields: {
          userObjectId: { $toObjectId: "$ma_doc_gia" },
          bookObjectId: { $toObjectId: "$ma_sach" },
        },
      },
      // Nối với bảng người dùng để lấy tên
      {
        $lookup: {
          from: "nguoidung",
          localField: "userObjectId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Nối với bảng sách để lấy tên sách và ảnh bìa
      {
        $lookup: {
          from: "sach",
          localField: "bookObjectId",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },

      // Chọn các trường cần thiết để trả về
      {
        $project: {
          _id: 1,
          noi_dung: 1,
          ti_le: 1,
          ngay_tao: 1,
          "user.ho_ten": 1,
          "user.email": 1,
          "book.ten_sach": 1,
          "book.anh_bia": 1,
        },
      },
    ];

    return await this.Comment.aggregate(pipeline).toArray();
  }
}

module.exports = CommentService;
