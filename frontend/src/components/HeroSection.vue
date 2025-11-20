<template>
  <v-sheet class="py-16 py-md-16 bg-surface-variant text-center" elevation="0">
    <v-container class="px-4">
      <v-row justify="center" align="center" no-gutters>
        <v-col cols="12" md="8" lg="6">
          <h1
            class="text-h4 text-sm-h3 text-md-h2 font-weight-black text-primary mb-4"
          >
            📚 Khám phá Sức mạnh của Tri thức
          </h1>

          <p class="text-subtitle-1 text-onSurface mb-8">
            Khám phá kho sách khổng lồ, từ tiểu thuyết bán chạy đến các tài liệu
            học thuật quý giá, và mượn ngay cuốn sách bạn yêu thích!
          </p>

          <v-btn
            to="/books"
            router
            color="primary"
            variant="flat"
            size="large"
            rounded="xl"
            elevation="10"
            class="text-body-1 font-weight-bold"
          >
            <v-icon start>mdi-magnify</v-icon>
            Khám phá ngay
          </v-btn>

          <v-btn
            to="/login"
            variant="text"
            size="large"
            rounded="xl"
            class="ml-4 text-primary font-weight-medium d-none d-sm-inline-flex"
          >
            <v-icon start>mdi-account-circle-outline</v-icon>
            Đăng nhập
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mt-12" justify="center" no-gutters>
        <v-col cols="12">
          <BookSlider />
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import BookSlider from "./BookSlider.vue";

export default {
  name: "HeroSection",
  components: {
    BookSlider,
  },
};
</script>

<style scoped>
.bg-surface-variant {
  /* Tạo hiệu ứng nền hơi ngả màu (nếu bạn không dùng bg-gray-50) */
  background-color: var(--v-theme-background) !important;
}
</style>
