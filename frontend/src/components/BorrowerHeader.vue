<template>
  <v-app-bar app flat color="primary" elevation="2" class="px-2">
    <!-- Logo & Title -->
    <v-toolbar-title
      class="font-weight-bold text-h6 ml-2 d-flex align-center cursor-pointer"
      @click="$router.push('/')"
    >
      <v-icon size="28" class="mr-2">mdi-bookshelf</v-icon>
      <span class="d-none d-sm-inline">Thư Viện Trực Tuyến</span>
      <span class="d-inline d-sm-none">TVTT</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- DESKTOP NAVIGATION -->
    <div class="d-none d-md-flex align-center">
      <router-link to="/" custom v-slot="{ href, navigate, isActive }">
        <v-btn
          :href="href"
          @click="navigate"
          :class="['nav-btn', { 'nav-btn-active': isActive }]"
          variant="text"
          rounded="lg"
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
          rounded="lg"
        >
          Sách
        </v-btn>
      </router-link>

      <!-- SỬA LẠI ĐIỀU KIỆN Ở ĐÂY -->
      <!-- Hiện nếu đã đăng nhập VÀ không phải là admin -->
      <router-link
        v-if="isLoggedIn && user.role !== 'admin'"
        to="/borrowed-books"
        custom
        v-slot="{ href, navigate, isActive }"
      >
        <v-btn
          :href="href"
          @click="navigate"
          :class="['nav-btn', { 'nav-btn-active': isActive }]"
          variant="text"
          rounded="lg"
        >
          Sách đã mượn
        </v-btn>
      </router-link>
    </div>

    <v-divider
      vertical
      inset
      class="mx-4 d-none d-md-flex bg-white opacity-20"
    ></v-divider>

    <!-- AUTHENTICATION AREA -->
    <template v-if="isLoggedIn">
      <!-- User Dropdown -->
      <v-menu offset-y transition="scale-transition">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="ml-2 px-2 text-none user-menu-btn"
            variant="text"
            rounded="pill"
          >
            <v-avatar size="32" class="mr-2 border-sm">
              <v-img
                :src="user.anh_dai_dien || defaultAvatar"
                alt="Avatar"
                cover
              ></v-img>
            </v-avatar>
            <span
              class="font-weight-medium d-none d-lg-inline-block text-body-2"
            >
              {{ user.ho_ten || user.name || "Tài khoản" }}
            </span>
            <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list density="compact" elevation="6" rounded="lg" class="mt-2 py-2">
          <v-list-item @click="goToProfile" active-color="primary">
            <template v-slot:prepend>
              <v-icon size="small" class="mr-2"
                >mdi-account-circle-outline</v-icon
              >
            </template>
            <v-list-item-title>Thông tin cá nhân</v-list-item-title>
          </v-list-item>

          <!-- Menu Item dành riêng cho Admin đã đăng nhập -->
          <v-list-item
            v-if="user.role === 'admin'"
            @click="goToDashboard"
            active-color="primary"
          >
            <template v-slot:prepend>
              <v-icon size="small" class="mr-2"
                >mdi-view-dashboard-outline</v-icon
              >
            </template>
            <v-list-item-title>Quản lí thư viện</v-list-item-title>
          </v-list-item>

          <!-- Thêm vào Menu thả xuống cho tiện (Desktop) -->
          <v-list-item
            v-if="user.role !== 'admin'"
            to="/borrowed-books"
            active-color="primary"
          >
            <template v-slot:prepend>
              <v-icon size="small" class="mr-2">mdi-book-clock-outline</v-icon>
            </template>
            <v-list-item-title>Sách đã mượn</v-list-item-title>
          </v-list-item>

          <v-divider class="my-1" />

          <v-list-item @click="logout" class="text-error">
            <template v-slot:prepend>
              <v-icon size="small" class="mr-2">mdi-logout</v-icon>
            </template>
            <v-list-item-title>Đăng xuất</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <template v-else>
      <!-- Admin Login Button -->
      <div class="d-none d-md-flex mr-2">
        <v-tooltip text="Dành cho Quản trị viên" location="bottom">
          <template v-slot:activator="{ props }">
            <router-link to="/login-admin" custom v-slot="{ href, navigate }">
              <v-btn
                v-bind="props"
                :href="href"
                @click="navigate"
                icon
                density="comfortable"
                variant="text"
                color="white"
                class="opacity-70 hover-opacity-100"
              >
                <v-icon>mdi-shield-crown-outline</v-icon>
              </v-btn>
            </router-link>
          </template>
        </v-tooltip>
      </div>

      <!-- User Login/Register -->
      <div class="d-none d-md-flex">
        <router-link to="/login" custom v-slot="{ href, navigate }">
          <v-btn
            :href="href"
            @click="navigate"
            variant="text"
            class="nav-btn font-weight-bold"
          >
            Đăng nhập
          </v-btn>
        </router-link>
        <router-link to="/register" custom v-slot="{ href, navigate }">
          <v-btn
            :href="href"
            @click="navigate"
            color="white"
            variant="flat"
            rounded="pill"
            class="ml-2 px-6 text-primary font-weight-bold"
          >
            Đăng ký
          </v-btn>
        </router-link>
      </div>
    </template>

    <!-- Mobile Menu Icon -->
    <v-app-bar-nav-icon
      class="d-md-none ml-2"
      @click="drawer = !drawer"
    ></v-app-bar-nav-icon>
  </v-app-bar>

  <!-- MOBILE NAVIGATION DRAWER -->
  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="right"
    class="d-md-none"
  >
    <!-- Header Drawer -->
    <div class="pa-4 bg-primary text-white">
      <div class="d-flex align-center mb-2">
        <v-icon class="mr-2">mdi-bookshelf</v-icon>
        <span class="text-h6 font-weight-bold">Menu</span>
      </div>
      <div v-if="isLoggedIn" class="d-flex align-center mt-3">
        <v-avatar size="40" class="mr-3 border-sm">
          <v-img :src="user.anh_dai_dien || defaultAvatar" cover></v-img>
        </v-avatar>
        <div>
          <div class="font-weight-bold">{{ user.ho_ten || "Xin chào" }}</div>
          <div class="text-caption opacity-80">{{ user.email }}</div>
        </div>
      </div>
    </div>

    <v-list nav density="comfortable" class="mt-2">
      <v-list-item to="/" link active-color="primary">
        <template v-slot:prepend><v-icon>mdi-home-outline</v-icon></template>
        <v-list-item-title>Trang chủ</v-list-item-title>
      </v-list-item>

      <v-list-item to="/books" link active-color="primary">
        <template v-slot:prepend
          ><v-icon>mdi-book-multiple-outline</v-icon></template
        >
        <v-list-item-title>Sách</v-list-item-title>
      </v-list-item>

      <!-- SỬA LẠI ĐIỀU KIỆN MOBILE -->
      <v-list-item
        v-if="isLoggedIn && user.role !== 'admin'"
        to="/borrowed-books"
        link
        active-color="primary"
      >
        <template v-slot:prepend
          ><v-icon>mdi-book-clock-outline</v-icon></template
        >
        <v-list-item-title>Sách đã mượn</v-list-item-title>
      </v-list-item>

      <v-divider class="my-3" />

      <template v-if="isLoggedIn">
        <v-list-item @click="goToProfile" link active-color="primary">
          <template v-slot:prepend
            ><v-icon>mdi-account-circle-outline</v-icon></template
          >
          <v-list-item-title>Thông tin cá nhân</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="user.role === 'admin'"
          @click="goToDashboard"
          link
          active-color="primary"
        >
          <template v-slot:prepend
            ><v-icon>mdi-view-dashboard-outline</v-icon></template
          >
          <v-list-item-title>Quản lí thư viện</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout" class="text-red-darken-1" link>
          <template v-slot:prepend><v-icon>mdi-logout</v-icon></template>
          <v-list-item-title>Đăng xuất</v-list-item-title>
        </v-list-item>
      </template>

      <template v-else>
        <v-list-subheader class="text-uppercase font-weight-bold mb-2"
          >Tài khoản</v-list-subheader
        >

        <v-list-item to="/login" link active-color="primary">
          <template v-slot:prepend><v-icon>mdi-login</v-icon></template>
          <v-list-item-title>Đăng nhập độc giả</v-list-item-title>
        </v-list-item>

        <v-list-item to="/register" link active-color="primary">
          <template v-slot:prepend
            ><v-icon>mdi-account-plus-outline</v-icon></template
          >
          <v-list-item-title>Đăng ký thành viên</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item to="/login-admin" link color="blue-grey">
          <template v-slot:prepend
            ><v-icon>mdi-shield-crown-outline</v-icon></template
          >
          <v-list-item-title>Đăng nhập Quản trị</v-list-item-title>
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
  created() {
    if (this.isLoggedIn) {
      const storedUser = localStorage.getItem("user");
      try {
        this.user = storedUser ? JSON.parse(storedUser) : {};
        // Log ra để kiểm tra nếu cần
        // console.log("User Info:", this.user);
      } catch (e) {
        this.user = {};
      }
    }
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
      this.drawer = false;
    },
    goToDashboard() {
      this.$router.push("/admin/dashboard");
      this.drawer = false;
    },
  },
};
</script>

<style scoped>
/* Reset mặc định của router-link */
.router-link-exact-active {
  text-decoration: none;
}

.cursor-pointer {
  cursor: pointer;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  margin: 0 4px;
  transition: all 0.2s ease-in-out;
  letter-spacing: 0.3px;
  text-transform: capitalize;
}

.nav-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-btn-active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 700;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.user-menu-btn {
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s;
}

.user-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.opacity-20 {
  opacity: 0.2;
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-80 {
  opacity: 0.8;
}
.hover-opacity-100:hover {
  opacity: 1 !important;
}

.border-sm {
  border: 2px solid rgba(255, 255, 255, 0.5);
}
</style>
