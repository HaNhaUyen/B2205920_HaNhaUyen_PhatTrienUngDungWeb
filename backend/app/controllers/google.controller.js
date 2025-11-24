// controllers/google.controller.js
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");
const config = require("../config"); // nếu bạn dùng config/index.js như trước

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  (config && config.google && config.google.clientId) ||
  "";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (config && config.jwt && config.jwt.secret) ||
  "library_staff_secret";
const JWT_EXPIRES =
  process.env.JWT_EXPIRES ||
  (config && config.jwt && config.jwt.expiresIn) ||
  "1d";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res, next) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return next(new ApiError(400, "Missing id_token"));
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email && payload.email.toLowerCase();
    const name = payload.name || payload.given_name || "No name";
    const picture = payload.picture || null;

    if (!email) {
      return next(new ApiError(400, "Không lấy được email từ Google"));
    }

    const userService = new UserService(MongoDB.client);

    // Tìm user theo email (service của bạn có findByEmail)
    let user = await userService.findByEmail(email);

    // Nếu chưa có user, tạo mới (upsert của bạn sẽ set created date,...)
    if (!user) {
      const newUserPayload = {
        ho_ten: name,
        email: email,
        anh_dai_dien: picture,
        mat_khau: null,
        vai_tro: "reader", // hoặc 'user' theo bạn muốn
        trang_thai: "active",
        auth_type: "google",
      };

      const created = await userService.create(newUserPayload);
      // create trả về result (findOneAndUpdate result). Lấy value nếu có
      user = created.value || (await userService.findByEmail(email));
    } else {
      // Nếu user tồn tại nhưng chưa có avatar, cập nhật avatar từ Google (tuỳ bạn)
      if (!user.anh_dai_dien && picture) {
        try {
          await userService.update(user._id, { anh_dai_dien: picture });
          user = await userService.findById(user._id);
        } catch (err) {
          // không fatal
          console.warn("Không thể cập nhật avatar:", err.message || err);
        }
      }
    }

    // Kiểm tra trạng thái tài khoản
    if (user.trang_thai && user.trang_thai !== "active") {
      return next(new ApiError(403, "Tài khoản của bạn đang bị khóa"));
    }

    // Tạo JWT giống với login hiện tại
    const token = jwt.sign({ id: user._id, role: user.vai_tro }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.send({
      message: "Google login thành công",
      token,
      user: {
        id: user._id,
        name: user.ho_ten,
        email: user.email,
        role: user.vai_tro,
        anh_dai_dien: user.anh_dai_dien || null,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    // Nếu token invalid -> trả 401
    if (error && error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Google token không hợp lệ"));
    }
    return next(new ApiError(500, "Lỗi xác thực Google"));
  }
};
