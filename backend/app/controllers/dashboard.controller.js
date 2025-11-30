const DashboardService = require("../services/dashboard.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.getOverview = async (req, res, next) => {
  try {
    const dashboardService = new DashboardService(MongoDB.client);
    const data = await dashboardService.getOverview();
    return res.send(data);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy dữ liệu tổng quan"));
  }
};
