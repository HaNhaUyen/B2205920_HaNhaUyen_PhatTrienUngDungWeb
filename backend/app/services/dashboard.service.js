// app/services/dashboard.service.js

const { ObjectId } = require("mongodb");

class DashboardService {
  constructor(client) {
    this.User = client.db().collection("nguoidung");
    this.Book = client.db().collection("sach");
    this.Borrow = client.db().collection("theodoimuonsach");
    this.Author = client.db().collection("tacgia");
    this.Category = client.db().collection("theloai");
    this.Comment = client.db().collection("danhgia"); // <--- Thêm dòng này
  }

  async getOverview() {
    // 1. Số liệu tổng quan (Giữ nguyên)
    const totalReaders = await this.User.countDocuments({ vai_tro: "reader" });
    const totalBooks = await this.Book.countDocuments();
    const totalBorrows = await this.Borrow.countDocuments();

    // 2. Độc giả mới (Giữ nguyên)
    const recentUsers = await this.User.find({ vai_tro: "reader" })
      .sort({ ngay_tao: -1 })
      .limit(5)
      .toArray();

    // 3. ➤ THAY ĐỔI: Lấy 5 sách có đánh giá cao nhất
    const topBooks = await this.Comment.aggregate([
      // Bước 1: Nhóm theo mã sách và tính trung bình số sao
      {
        $group: {
          _id: "$ma_sach",
          avgRating: { $avg: "$ti_le" },
          totalReviews: { $sum: 1 },
        },
      },
      // Bước 2: Sắp xếp điểm cao nhất -> nhiều review nhất
      { $sort: { avgRating: -1, totalReviews: -1 } },
      // Bước 3: Lấy top 5
      { $limit: 5 },
      // Bước 4: Nối bảng Sách để lấy tên sách
      {
        $addFields: { bookIdObj: { $toObjectId: "$_id" } },
      },
      {
        $lookup: {
          from: "sach",
          localField: "bookIdObj",
          foreignField: "_id",
          as: "bookInfo",
        },
      },
      { $unwind: "$bookInfo" },
      // Bước 5: Nối bảng Tác giả (từ trong bookInfo) để lấy tên tác giả
      {
        $addFields: { authorIdObj: { $toObjectId: "$bookInfo.ma_tac_gia" } },
      },
      {
        $lookup: {
          from: "tacgia",
          localField: "authorIdObj",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
      // Bước 6: Chọn các trường cần hiển thị
      {
        $project: {
          ten_sach: "$bookInfo.ten_sach",
          anh_bia: "$bookInfo.anh_bia",
          avgRating: 1,
          totalReviews: 1,
          ten_tac_gia: "$authorInfo.ho_ten",
        },
      },
    ]).toArray();

    // 4. Biểu đồ (Giữ nguyên)
    // ... (Giữ nguyên logic biểu đồ cũ của bạn) ...
    // Để code ngắn gọn mình không paste lại đoạn biểu đồ, hãy giữ nguyên nó nhé.
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const borrowStatsLast7Days = await this.Borrow.aggregate([
      { $match: { ngay_muon: { $gte: startDate, $lte: endDate } } },
      {
        $project: {
          ngay_muon: {
            $dateToString: { format: "%Y-%m-%d", date: "$ngay_muon" },
          },
        },
      },
      { $group: { _id: "$ngay_muon", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray();

    return {
      totalReaders,
      totalBooks,
      totalBorrows,
      totalFines: 0,
      recentUsers,
      topBooks, // <--- Trả về biến mới này thay vì recentBooks
      borrowStatsLast7Days,
    };
  }
}

module.exports = DashboardService;
