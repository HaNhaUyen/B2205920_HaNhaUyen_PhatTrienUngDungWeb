const BorrowService = require("../services/borrow.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// ============================================================
// CÁC CHỨC NĂNG CƠ BẢN (GIỮ NGUYÊN)
// ============================================================

exports.create = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const payload = {
      ...req.body,
      ngay_muon: req.body.ngay_muon ? new Date(req.body.ngay_muon) : new Date(),
      han_tra: req.body.han_tra ? new Date(req.body.han_tra) : null,
    };
    const document = await borrowService.create(payload);
    return res.status(201).json(document);
  } catch (error) {
    return next(new ApiError(500, error.message || "Lỗi khi tạo phiếu mượn"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const documents = await borrowService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn"));
  }
};

exports.findAllWithDetails = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const documents = await borrowService.findWithDetails();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tìm phiếu mượn"));
  }
};

exports.update = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const payload = {
      ...req.body,
      ngay_muon: req.body.ngay_muon ? new Date(req.body.ngay_muon) : undefined,
      han_tra: req.body.han_tra ? new Date(req.body.han_tra) : undefined,
      ngay_tra_thuc_te: req.body.ngay_tra_thuc_te
        ? new Date(req.body.ngay_tra_thuc_te)
        : undefined,
    };
    const document = await borrowService.update(req.params.id, payload);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật phiếu mượn"));
  }
};

exports.approve = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const payload = { ...req.body };
    const document = await borrowService.update(req.params.id, payload);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật phiếu mượn"));
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.returnBook(
      req.params.id,
      req.body.ngay_tra_thuc_te
    );
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi trả sách"));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy yêu cầu mượn sách"));
    }

    return res.send({ message: "Đã xóa thành công" });
  } catch (error) {
    console.error("Lỗi DELETE Borrow:", error);
    return next(
      new ApiError(500, `Lỗi khi xóa yêu cầu mượn sách: ${error.message}`)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const deletedCount = await borrowService.deleteAll();
    return res.send({ message: `${deletedCount} phiếu mượn đã được xoá` });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá tất cả phiếu mượn"));
  }
};

exports.findByUserId = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const borrows = await borrowService.find({ ma_doc_gia: req.params.userId });
    return res.send(borrows);
  } catch (error) {
    console.error("FindByUserId Error:", error);
    return next(new ApiError(500, "Lỗi khi tìm lượt mượn của người dùng"));
  }
};

// ============================================================
// CÁC CHỨC NĂNG MỚI: XỬ LÝ MẤT/HƯ HỎNG SÁCH
// ============================================================

/**
 * 1. REPORT ISSUE
 * User báo cáo mất hoặc hư sách.
 * Logic:
 * - Update trạng thái phiếu mượn -> "gap_su_co"
 * - Service sẽ tự động set hạn xử lý (+14 ngày) và KHÓA user.
 */
exports.reportIssue = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const { id } = req.params;
    // ly_do: 'mat_sach' hoặc 'hu_hong'
    const { ly_do } = req.body;

    if (!["mat_sach", "hu_hong"].includes(ly_do)) {
      return next(
        new ApiError(
          400,
          "Lý do không hợp lệ. Chỉ chấp nhận 'mat_sach' hoặc 'hu_hong'."
        )
      );
    }

    const document = await borrowService.reportIssue(id, { loai_su_co: ly_do });

    return res.send({
      message:
        "Đã ghi nhận sự cố. Tài khoản của bạn tạm thời bị khóa cho đến khi sự cố được giải quyết.",
      document,
    });
  } catch (error) {
    return next(new ApiError(500, error.message || "Lỗi khi báo cáo sự cố"));
  }
};

/**
 * 2. CHOOSE COMPENSATION
 * User chọn cách đền bù.
 * Logic:
 * - 'tu_mua': Tự mua sách trả.
 * - 'den_tien': Đền tiền (Hệ thống tự tính giá + phí).
 */
exports.chooseCompensation = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const { id } = req.params;
    // phuong_an: 'tu_mua' hoặc 'den_tien'
    const { phuong_an } = req.body;

    if (!["tu_mua", "den_tien"].includes(phuong_an)) {
      return next(
        new ApiError(
          400,
          "Phương án không hợp lệ. Chọn 'tu_mua' hoặc 'den_tien'."
        )
      );
    }

    const document = await borrowService.updateCompensationMethod(
      id,
      phuong_an
    );

    return res.send({
      message: "Đã cập nhật phương án đền bù.",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(500, error.message || "Lỗi khi cập nhật phương án đền bù")
    );
  }
};

/**
 * 3. SCAN OVERDUE (Hệ thống/Admin kích hoạt)
 * Logic:
 * - Quét các đơn "gap_su_co" đã quá hạn xử lý (14 ngày).
 * - Nếu chưa chọn phương án -> Tự động chuyển thành "den_tien".
 * - Giữ nguyên trạng thái khóa tài khoản.
 */
exports.scanOverdueIssues = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);

    // Hàm này trong service sẽ tìm các đơn quá hạn và update
    const updatedCount = await borrowService.autoProcessOverdueIssues();

    return res.send({
      message: `Quét hoàn tất. Đã tự động xử lý ${updatedCount} trường hợp quá hạn phản hồi.`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi quét sự cố quá hạn"));
  }
};

/**
 * 4. RESOLVE ISSUE (Admin Action)
 * Admin xác nhận đã nhận sách hoặc tiền.
 * Logic:
 * - Đóng hồ sơ (trạng thái 'da_xu_ly' hoặc 'da_tra').
 * - Cập nhật kho sách (nếu là 'tu_mua').
 * - Kiểm tra nếu User không còn nợ xấu nào khác -> MỞ KHÓA tài khoản.
 */
exports.resolveIssue = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const { id } = req.params;
    const { ghi_chu } = req.body; // Admin có thể ghi chú thêm

    const document = await borrowService.completeCompensation(id, ghi_chu);

    return res.send({
      message: "Sự cố đã được giải quyết. Quyền mượn sách đã được cập nhật.",
      document,
    });
  } catch (error) {
    return next(new ApiError(500, error.message || "Lỗi khi giải quyết sự cố"));
  }
};
