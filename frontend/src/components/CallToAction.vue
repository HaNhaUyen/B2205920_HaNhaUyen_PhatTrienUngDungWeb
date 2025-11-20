<template>
  <v-container class="py-12 py-md-16">
    <v-card
      class="cta-card text-center pa-8 pa-md-12 elevation-10 rounded-xl"
      color="primary"
      dark
    >
      <h2 class="font-weight-black text-h4 text-md-h3 text-white mb-4">
        📥 Bắt đầu hành trình đọc sách của bạn
      </h2>
      <p class="text-subtitle-1 text-white opacity-9 mb-8">
        Tham gia ngay hôm nay! Chỉ với vài bước đơn giản, bạn đã có thể mượn
        sách trực tuyến.
      </p>

      <v-btn
        @click="handleExplore"
        size="x-large"
        color="secondary"
        variant="flat"
        rounded="pill"
        class="font-weight-bold text-none elevation-4"
      >
        <v-icon start>mdi-account-plus</v-icon>
        Đăng ký ngay
      </v-btn>

      <v-btn
        v-if="!isLoggedIn"
        @click="$router.push('/login')"
        variant="text"
        color="white"
        class="ml-4 text-none font-weight-medium"
      >
        Đã có tài khoản? Đăng nhập
      </v-btn>
    </v-card>
  </v-container>
</template>
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Computed property để kiểm tra trạng thái đăng nhập
const isLoggedIn = computed(() => {
  // Giả định 'token' được dùng để kiểm tra trạng thái
  return !!localStorage.getItem("token");
});

const handleExplore = () => {
  if (isLoggedIn.value) {
    // Nếu đã đăng nhập, chuyển đến trang sách
    router.push("/books");
  } else {
    // Nếu chưa đăng nhập, chuyển đến trang đăng ký
    router.push("/register");
  }
};
</script>
<style scoped>
.cta-card {
  position: relative;
  overflow: hidden;
}

.cta-card:hover {
  transform: scale(1.01);
}

/* Tăng cường độ mờ cho chữ phụ */
.opacity-9 {
  opacity: 0.9;
}
</style>
