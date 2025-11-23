<template>
  <v-app-bar app flat color="primary" dark>
    <v-toolbar-title class="font-weight-bold text-h6 ml-2">
      <v-icon size="28" class="mr-2">mdi-bookshelf</v-icon>
      Thư Viện Trực Tuyến
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- Desktop menu -->
    <div class="d-none d-md-flex align-center">
      <router-link to="/" custom v-slot="{ href, navigate, isActive }">
        <v-btn
          :href="href"
          @click="navigate"
          :class="['nav-btn', { 'nav-btn-active': isActive }]"
          variant="text"
        >
          Trang chủ
        </v-btn>
      </router-link>
      <router-link to="/books" custom v-slot="{ href, navigate, isActive }">
        <v-btn
          :href="href"
          @click="navigate"
          :class="['nav-btn', { 'nav-btn-active': isActive }]"
          variant="text"
        >
          Sách
        </v-btn>
      </router-link>
    </div>

    <!-- Nếu đã đăng nhập -->
    <template v-if="isLoggedIn">
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="ml-2 px-2 text-none user-menu-btn"
            variant="text"
            rounded="lg"
          >
            <v-avatar size="36" class="mr-2">
              <img :src="user.anh_dai_dien || defaultAvatar" alt="Avatar" />
            </v-avatar>
            <span
              class="font-weight-medium d-none d-lg-inline-block text-body-1"
            >
              {{ user.name || "Tài khoản" }}
            </span>
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list density="compact" elevation="6" rounded="lg" class="mt-4">
          <v-list-item @click="goToProfile">
            <template v-slot:prepend
              ><v-icon>mdi-account-circle-outline</v-icon></template
            >
            <v-list-item-title>Thông tin cá nhân</v-list-item-title>
          </v-list-item>

          <!-- Chỉ hiện nút quản trị nếu role là admin -->
          <v-list-item v-if="user.role === 'admin'" @click="goToDashboard">
            <template v-slot:prepend
              ><v-icon>mdi-view-dashboard-outline</v-icon></template
            >
            <v-list-item-title>Quản lý thư viện</v-list-item-title>
          </v-list-item>

          <v-divider v-if="user.role === 'admin'" class="my-1" />

          <v-list-item @click="logout" color="error">
            <template v-slot:prepend><v-icon>mdi-logout</v-icon></template>
            <v-list-item-title>Đăng xuất</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- Nếu chưa đăng nhập -->
    <template v-else>
      <router-link to="/login" custom v-slot="{ href, navigate }">
        <v-btn :href="href" @click="navigate" text class="nav-btn"
          >Đăng nhập người dùng</v-btn
        >
      </router-link>
      <router-link to="/login-admin" custom v-slot="{ href, navigate }">
        <v-btn :href="href" @click="navigate" text class="nav-btn ml-2"
          >Đăng nhập quản trị</v-btn
        >
      </router-link>
      <router-link to="/register" custom v-slot="{ href, navigate }">
        <v-btn
          :href="href"
          @click="navigate"
          color="secondary"
          variant="flat"
          rounded="lg"
          class="ml-2 px-4"
        >
          Đăng ký
        </v-btn>
      </router-link>
    </template>

    <v-app-bar-nav-icon
      class="d-md-none"
      @click="drawer = !drawer"
    ></v-app-bar-nav-icon>
  </v-app-bar>

  <!-- Mobile drawer -->
  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="right"
    class="d-md-none"
  >
    <v-list>
      <v-list-item to="/" link>
        <template v-slot:prepend><v-icon>mdi-home-outline</v-icon></template>
        <v-list-item-title>Trang chủ</v-list-item-title>
      </v-list-item>
      <v-list-item to="/books" link>
        <template v-slot:prepend
          ><v-icon>mdi-book-multiple-outline</v-icon></template
        >
        <v-list-item-title>Sách</v-list-item-title>
      </v-list-item>
      <v-divider class="my-2" />

      <template v-if="isLoggedIn">
        <v-list-item @click="goToProfile" link>
          <template v-slot:prepend
            ><v-icon>mdi-account-circle-outline</v-icon></template
          >
          <v-list-item-title>Thông tin cá nhân</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="user.role === 'admin'" @click="goToDashboard" link>
          <template v-slot:prepend
            ><v-icon>mdi-view-dashboard-outline</v-icon></template
          >
          <v-list-item-title>Quản lý thư viện</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout" color="error" link>
          <template v-slot:prepend><v-icon>mdi-logout</v-icon></template>
          <v-list-item-title>Đăng xuất</v-list-item-title>
        </v-list-item>
      </template>

      <template v-else>
        <v-list-item to="/login" link>
          <template v-slot:prepend><v-icon>mdi-login</v-icon></template>
          <v-list-item-title>Đăng nhập người dùng</v-list-item-title>
        </v-list-item>
        <v-list-item to="/login-admin" link>
          <template v-slot:prepend
            ><v-icon>mdi-shield-account-outline</v-icon></template
          >
          <v-list-item-title>Đăng nhập quản trị</v-list-item-title>
        </v-list-item>
        <v-list-item to="/register" link>
          <template v-slot:prepend
            ><v-icon>mdi-account-plus-outline</v-icon></template
          >
          <v-list-item-title>Đăng ký</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      user: {},
      defaultAvatar:
        "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
      drawer: false,
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("token");
    },
  },
  watch: {
    isLoggedIn(newVal) {
      if (newVal) {
        const storedUser = localStorage.getItem("user");
        this.user = storedUser ? JSON.parse(storedUser) : {};
      } else {
        this.user = {};
      }
    },
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
      window.location.reload();
    },
    goToProfile() {
      this.$router.push("/profile");
    },
    goToDashboard() {
      this.$router.push("/admin/dashboard");
    },
  },
};
</script>
