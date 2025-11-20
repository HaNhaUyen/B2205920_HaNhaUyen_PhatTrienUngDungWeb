<template>
  <v-container class="py-12 py-md-16">
    <h3 class="text-center font-weight-bold text-h4 text-primary mb-10">
      🗣️ Người dùng nói gì về chúng tôi?
    </h3>

    <v-row justify="center">
      <v-col
        v-for="(testimonial, index) in testimonials"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <v-card
          class="testimonial-card flex-grow-1 pa-6 elevation-8 rounded-lg d-flex flex-column align-center text-center"
          hover
        >
          <v-avatar class="mb-4" size="70" color="secondary-lighten-2">
            <v-icon size="40" color="white">mdi-account-circle</v-icon>
          </v-avatar>

          <v-rating
            :model-value="testimonial.rating"
            color="secondary"
            density="compact"
            readonly
            class="mb-3"
          ></v-rating>

          <p class="font-italic text-body-1 text-onSurfaceVariant">
            "{{ testimonial.comment }}"
          </p>

          <v-divider class="my-4" style="width: 50%"></v-divider>

          <h5 class="font-weight-bold text-subtitle-1 text-primary">
            {{ testimonial.name }}
          </h5>
          <p class="text-caption text-medium-emphasis">
            {{ testimonial.title }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
const testimonials = [
  {
    name: "Hoàng Linh",
    title: "Sinh viên, Hà Nội",
    comment:
      "Kho sách học thuật rất đầy đủ, giúp tôi hoàn thành đồ án xuất sắc. Dịch vụ tuyệt vời!",
    rating: 5,
  },
  {
    name: "Minh Khoa",
    title: "Nhân viên Văn phòng",
    comment:
      "Giao diện dễ sử dụng và luôn có những đầu sách bestseller mới nhất để thư giãn cuối tuần.",
    rating: 5,
  },
  {
    name: "Trần Quyên",
    title: "Freelancer",
    comment:
      "Tôi yêu thích tính năng gợi ý sách ở đây. Luôn tìm thấy những cuốn sách phù hợp với sở thích của mình.",
    rating: 4,
  },
  // 🌟 LỜI NHẬN XÉT MỚI THỨ 4 🌟
  {
    name: "Văn Chung",
    title: "Chuyên gia IT",
    comment:
      "Hệ thống tìm kiếm sách rất thông minh và nhanh chóng, tiết kiệm được nhiều thời gian.",
    rating: 5,
  },
];
</script>
<style scoped>
.testimonial-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--v-theme-surface-variant);
  /* Đảm bảo chiều cao bằng nhau nếu cần, nhưng flex-grow-1 đã giúp */
}

.testimonial-card:hover {
  transform: translateY(-5px); /* Nổi lên khi hover */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Tăng cường khả năng đọc của nhận xét */
.text-onSurfaceVariant {
  color: var(--v-theme-on-surface-variant) !important;
}
</style>
