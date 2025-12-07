const express = require("express");
const cors = require("cors");

const app = express();

const ApiError = require("./app/api-error");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Library application." });
});

// Import routes
const bookRoutes = require("./app/routes/book.route");
const authorRoutes = require("./app/routes/author.route");
const categoryRoutes = require("./app/routes/category.route");
const publisherRoutes = require("./app/routes/publisher.route");
const borrowRoutes = require("./app/routes/borrow.route"); // Đã chứa các tính năng báo mất/hư sách
const userRouter = require("./app/routes/user.route");
const commentRouter = require("./app/routes/comment.route");
const dashboardRouter = require("./app/routes/dashboard.route");

// ⚠️ Lưu ý: Bạn có dòng này nhưng chưa dùng.
// Nếu file này dùng để xuất báo cáo thống kê (PDF/Excel) thì hãy sửa lại tên file cho đúng chính tả.
// Nếu tính năng "Report" bạn định làm là "Báo mất sách", thì chúng ta ĐÃ LÀM trong borrowRoutes rồi, nên dòng này có thể xóa.
// const reportRouter = require("./app/routes/report.route"); // Sửa 'repot' thành 'report'

// Mount routes
app.use("/api/users", userRouter);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/comments", commentRouter);
app.use("/api/dashboard", dashboardRouter);

// Nếu bạn muốn dùng reportRouter cho thống kê, hãy bỏ comment dòng dưới:
// app.use("/api/reports", reportRouter);

// Handle 404
app.use((req, res, next) => {
  return next(new ApiError(404, `Resource not found`));
});

// Handle Errors
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
