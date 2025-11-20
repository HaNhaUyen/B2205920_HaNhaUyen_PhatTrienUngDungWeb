// Vuetify 3 - setup
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import { aliases, mdi } from "vuetify/iconsets/mdi";

// 1. Định nghĩa màu sắc của Theme
const customTheme = {
  dark: false, // Hoặc true nếu bạn muốn theme mặc định là dark
  colors: {
    background: "#F5F5F5", // Nền chung sáng, hơi ngả xám nhạt
    surface: "#FFFFFF", // Nền của card, pop-up, sidebar
    primary: "#1976D2", // Xanh lam cơ bản - Màu chính cho hành động (Nút, thanh điều hướng)
    "primary-darken-1": "#1565C0",
    secondary: "#FFB300", // Vàng/Cam - Màu phụ để làm nổi bật (Ví dụ: Icon quan trọng)
    "secondary-darken-1": "#FF8F00",
    error: "#B00020", // Đỏ - Cho thông báo lỗi
    info: "#2196F3", // Xanh da trời - Cho thông tin
    success: "#4CAF50", // Xanh lá - Cho hành động thành công
    warning: "#FB8C00", // Cam - Cho cảnh báo
    onBackground: "#1E1E1E", // Màu chữ trên background
    onSurface: "#1E1E1E", // Màu chữ trên surface
  },
};

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  // 2. Thêm đối tượng theme vào cấu hình
  theme: {
    defaultTheme: "customTheme", // Đặt tên theme mặc định là customTheme
    themes: {
      customTheme, // Thêm theme đã định nghĩa vào đây
    },
  },
});
