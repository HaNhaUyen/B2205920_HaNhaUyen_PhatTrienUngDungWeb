const express = require("express");
const borrowController = require("../controllers/borrow.controller");
const verifyToken = require("../middlewares/authJwt");

const router = express.Router();

// --- 1. Route hệ thống/quét (Đặt trước các route có :id) ---
// Quét các sự cố quá hạn xử lý (Admin hoặc Cron job gọi)
router
  .route("/scan-overdue")
  .post(verifyToken, borrowController.scanOverdueIssues);

// --- 2. Các route cơ bản ---
router
  .route("/")
  .get(verifyToken, borrowController.findAllWithDetails)
  .post(verifyToken, borrowController.create)
  .delete(verifyToken, borrowController.deleteAll);

// --- 3. Các route xử lý sự cố & Trả sách ---

// Người dùng báo cáo mất/hư hỏng sách
router.route("/:id/report").post(verifyToken, borrowController.reportIssue);

// Người dùng chọn phương án đền bù (Tự mua / Đền tiền)
router
  .route("/:id/compensation")
  .post(verifyToken, borrowController.chooseCompensation);

// Admin xác nhận đã giải quyết xong sự cố (Mở khóa tài khoản)
router.route("/:id/resolve").put(verifyToken, borrowController.resolveIssue);

// Trả sách thông thường
router.route("/:id/return").put(verifyToken, borrowController.returnBook);

// Duyệt mượn sách (nếu flow cần duyệt)
router.route("/:id/approve").put(verifyToken, borrowController.approve);

// --- 4. Các route thao tác CRUD trên ID ---
router
  .route("/:id")
  .get(borrowController.findOne)
  .put(verifyToken, borrowController.update)
  .delete(verifyToken, borrowController.delete);

// --- 5. Route tìm kiếm theo User ---
router.get("/user/:userId", borrowController.findByUserId);

module.exports = router;
