<template>
  <v-container class="py-12 py-md-16 text-center">
    <h3 class="text-center font-weight-bold text-h4 text-primary mb-10">
      Những tiện ích khi sử dụng thư viện trực tuyến
    </h3>
    <v-row justify="center">
      <v-col
        v-for="feature in features"
        :key="feature.title"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <v-card
          class="feature-card flex-grow-1 pa-6 elevation-4 rounded-xl d-flex flex-column align-center justify-center"
          hover
        >
          <v-sheet
            class="icon-circle mb-4 d-flex align-center justify-center rounded-circle"
            color="secondary-lighten-5"
            elevation="0"
          >
            <v-icon size="36" color="secondary">{{ feature.icon }}</v-icon>
          </v-sheet>

          <h4 class="font-weight-bold text-h6 text-primary mt-2 mb-2">
            {{ feature.title }}
          </h4>

          <p class="text-body-2 text-onSurfaceVariant px-2">
            {{ feature.description }}
          </p>

          <v-btn
            v-if="feature.link"
            :to="feature.link"
            variant="text"
            color="secondary"
            size="small"
            class="mt-3 text-none"
          >
            Tìm hiểu thêm
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
const features = [
  {
    icon: "mdi-truck-fast",
    title: "Giao sách tận nơi",
    description: "Giao hàng nhanh chóng và tiện lợi ngay tại nhà bạn.",
  },
  {
    icon: "mdi-book-open-page-variant",
    title: "Kho sách phong phú",
    description: "Hơn 10.000 đầu sách đa thể loại, từ học thuật đến giải trí.",
    link: "/catalog",
  },
  // 🌟 FEATURE MỚI THỨ 4 🌟
  {
    icon: "mdi-calendar-check",
    title: "Quản lý rõ ràng",
    description: "Theo dõi lịch sử mượn, gia hạn và nhắc nhở trả sách tự động.",
    link: "/profile/borrow-history",
  },
  // Chuyển cộng đồng yêu sách thành thứ tự cuối cùng (tùy chọn)
  {
    icon: "mdi-account-group",
    title: "Cộng đồng yêu sách",
    description:
      "Tham gia giao lưu, đánh giá và chia sẻ đam mê đọc cùng mọi người.",
    link: "/community",
  },
];
</script>
<style scoped>
/* Hiệu ứng tổng thể cho Card */
.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--v-theme-surface-variant); /* Viền nhẹ */
}

.feature-card:hover {
  transform: translateY(-8px); /* Nổi lên khi hover */
  box-shadow: 0 12px 25px rgba(var(--v-theme-primary), 0.15) !important; /* Đổ bóng màu primary nhẹ */
}

/* Vòng tròn Icon nổi bật */
.icon-circle {
  width: 72px;
  height: 72px;
  background-color: var(--v-theme-secondary-lighten-5); /* Nền màu rất nhạt */
  transition: 0.3s;
}

.feature-card:hover .icon-circle {
  background-color: var(
    --v-theme-secondary-lighten-3
  ) !important; /* Đậm hơn khi hover */
}
</style>
