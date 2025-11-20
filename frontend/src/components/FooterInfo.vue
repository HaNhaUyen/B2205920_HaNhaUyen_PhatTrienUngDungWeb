<template>
  <v-footer color="grey-darken-4" dark class="pa-0">
    <v-container class="py-10">
      <v-row justify="center" align="start">
        <v-col cols="12" md="6" class="text-center text-md-left mb-8">
          <div class="d-flex align-center justify-center justify-md-start mb-3">
            <v-icon color="primary" size="30">mdi-bookshelf</v-icon>
            <span class="text-h6 font-weight-bold ml-2 text-white text-no-wrap">
              Thư Viện Trực Tuyến
            </span>
          </div>

          <p class="footer-text footer-description">
            Khám phá kho sách khổng lồ, nơi tri thức luôn sẵn sàng cho bạn.
          </p>

          <div class="mt-4 d-flex justify-center justify-md-start">
            <v-btn
              icon
              size="small"
              variant="text"
              color="white"
              href="#"
              target="_blank"
              ><v-icon>mdi-facebook</v-icon></v-btn
            >
            <v-btn
              icon
              size="small"
              variant="text"
              color="white"
              href="#"
              target="_blank"
              ><v-icon>mdi-twitter</v-icon></v-btn
            >
            <v-btn
              icon
              size="small"
              variant="text"
              color="white"
              href="#"
              target="_blank"
              ><v-icon>mdi-instagram</v-icon></v-btn
            >
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <v-row justify="start">
            <v-col cols="4" sm="4" class="footer-link-col">
              <h5 class="footer-title">Liên kết</h5>
              <v-list class="footer-list list-align-mobile">
                <v-list-item to="/" link
                  ><v-list-item-title class="footer-text"
                    >Trang chủ</v-list-item-title
                  ></v-list-item
                >
                <v-list-item to="/books" link
                  ><v-list-item-title class="footer-text"
                    >Kho sách</v-list-item-title
                  ></v-list-item
                >
                <v-list-item to="/about" link
                  ><v-list-item-title class="footer-text"
                    >Về chúng tôi</v-list-item-title
                  ></v-list-item
                >
              </v-list>
            </v-col>

            <v-col cols="4" sm="4" class="footer-link-col">
              <h5 class="footer-title">Hỗ trợ</h5>
              <v-list class="footer-list list-align-mobile">
                <v-list-item to="/faq" link
                  ><v-list-item-title class="footer-text"
                    >Hỏi đáp (FAQ)</v-list-item-title
                  ></v-list-item
                >
                <v-list-item to="/contact" link
                  ><v-list-item-title class="footer-text"
                    >Liên hệ</v-list-item-title
                  ></v-list-item
                >
                <v-list-item to="/terms" link
                  ><v-list-item-title class="footer-text"
                    >Điều khoản</v-list-item-title
                  ></v-list-item
                >
              </v-list>
            </v-col>

            <v-col cols="4" sm="4" class="footer-contact-col">
              <h5 class="footer-title">Liên hệ</h5>

              <p class="footer-text contact-line">
                <v-icon start size="16" color="primary">mdi-map-marker</v-icon
                >Đường XYZ, Quận ABC, TP. Hồ Chí Minh
              </p>
              <p class="footer-text contact-line">
                <v-icon start size="16" color="primary">mdi-email</v-icon
                >support@thuvientructuyen.vn
              </p>
              <p class="footer-text contact-line">
                <v-icon start size="16" color="primary">mdi-phone</v-icon>(028)
                1234 5678
              </p>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>
<style scoped>
/* -------------------- STYLE CHUNG & MÀU SẮC -------------------- */
.footer-title,
.footer-text,
.footer-list .v-list-item-title {
  color: white !important;
}

.footer-text {
  font-size: 0.85rem;
  line-height: 1.6;
}

.contact-line {
  margin-bottom: 6px;
  white-space: nowrap;
}

/* -------------------- LIST VÀ CĂN CHỈNH -------------------- */
.footer-list {
  background: transparent !important;
  padding: 0 !important;
}

.footer-list .v-list-item {
  /* Xóa padding/margin để tránh lỗi chồng chéo */
  padding: 4px 0 !important;
  min-height: 26px !important;
  margin: 0 !important;
  text-align: center; /* Mặc định căn giữa cho mobile */
}

/* -------------------- RESPONSIVE FIXES -------------------- */

@media (min-width: 960px) {
  /* Cho md và lớn hơn */
  /* CĂN TRÁI CHO CỘT TRÁI */
  .footer-description {
    text-align: left !important;
    margin-left: 0 !important;
  }

  /* CĂN TRÁI CHO TIÊU ĐỀ VÀ TEXT CỦA CỘT PHẢI */
  .footer-title,
  .footer-contact-col .footer-text,
  .footer-link-col .footer-list .v-list-item-title {
    text-align: left !important;
    margin-left: 0 !important;
  }

  /* Đảm bảo link list items căn trái */
  .footer-list .v-list-item {
    justify-content: flex-start !important;
  }

  /* Điều chỉnh căn chỉnh cho các cột 4, 4, 4 trên desktop */
  .footer-link-col {
    padding-left: 12px !important;
  }
}

@media (max-width: 959px) {
  /* Cho mobile và tablet */
  /* Căn giữa cho mô tả cột trái */
  .footer-description {
    text-align: center !important;
    margin: auto;
  }
}
</style>
