<template>
  <v-app class="bg-grey-lighten-5">
    <!-- 1. TOP BAR (Thanh tiêu đề ngang) -->
    <v-app-bar
      elevation="0"
      height="70"
      class="border-b px-4 admin-header"
      color="white"
    >
      <!-- THAY ĐỔI TẠI ĐÂY: Thay v-app-bar-nav-icon bằng v-btn có icon sách -->
      <v-tooltip text="Đóng/Mở Menu" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            variant="text"
            color="blue-grey-darken-3"
            @click="drawer = !drawer"
            class="mr-2"
          >
            <!-- Icon mdi-bookshelf nhìn giống các gạch ngang của menu nhưng là sách -->
            <v-icon color="blue-grey-darken-4" size="32"
              >mdi-shield-crown</v-icon
            >
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Thêm tiêu đề nhỏ bên cạnh để nhìn cân đối hơn -->
      <div class="d-flex flex-column">
        <span
          class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3 lh-1"
        >
          Quản Trị
        </span>
      </div>

      <v-spacer></v-spacer>

      <!-- (Giữ nguyên các phần bên phải nếu có, ví dụ Avatar, thông báo...) -->
    </v-app-bar>

    <!-- 2. SIDEBAR (Giữ nguyên) -->
    <AdminSidebar v-model="drawer" />

    <!-- 3. MAIN CONTENT (Giữ nguyên) -->
    <v-main>
      <v-container fluid class="pa-6 h-100">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AdminSidebar from "./AdminSidebar.vue";

export default {
  name: "AdminLayout",
  components: { AdminSidebar },
  data() {
    return {
      drawer: true,
    };
  },
};
</script>

<style scoped>
.admin-header {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
}
.lh-1 {
  line-height: 1;
}
</style>
