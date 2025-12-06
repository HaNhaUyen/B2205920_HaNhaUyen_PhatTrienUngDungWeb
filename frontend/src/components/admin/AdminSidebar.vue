<template>
  <v-navigation-drawer
    v-model="internalDrawer"
    elevation="10"
    class="sidebar-gradient"
    theme="dark"
    width="280"
    :rail="rail"
    expand-on-hover
    mobile-breakpoint="960"
  >
    <!-- ĐÃ XÓA PHẦN HEADER (ADMIN PORTAL) TẠI ĐÂY -->

    <!-- Danh sách Menu -->
    <!-- mt-4: cách lề trên một chút cho đỡ dính sát mép -->
    <v-list density="comfortable" nav class="mt-4 px-3">
      <v-list-item
        v-for="(item, index) in menuItems"
        :key="index"
        :to="item.to"
        rounded="lg"
        class="mb-1 transition-swing"
        active-class="active-item-gradient"
        color="white"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon" size="small" class="mr-2"></v-icon>
        </template>
        <v-list-item-title class="font-weight-medium">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "AdminSidebar",
  // 1. Nhận prop từ Layout truyền vào
  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },
  },
  // 2. Định nghĩa sự kiện để báo ngược lại Layout
  emits: ["update:modelValue"],
  data() {
    return {
      rail: false, // Chế độ thu nhỏ sidebar
      menuItems: [
        {
          title: "Tổng quan",
          icon: "mdi-view-dashboard-outline",
          to: "/admin/dashboard",
        },
        {
          title: "Người dùng",
          icon: "mdi-account-group-outline",
          to: "/admin/users",
        },
        {
          title: "Sách",
          icon: "mdi-book-open-page-variant-outline",
          to: "/admin/books",
        },
        {
          title: "Thể loại",
          icon: "mdi-shape-outline",
          to: "/admin/categories",
        },
        {
          title: "Nhà xuất bản",
          icon: "mdi-office-building-cog-outline",
          to: "/admin/publishers",
        },
        {
          title: "Tác giả",
          icon: "mdi-fountain-pen-tip",
          to: "/admin/authors",
        },
        {
          title: "Đánh giá",
          icon: "mdi-comment-text-multiple-outline",
          to: "/admin/comments",
        },
        {
          title: "Theo dõi mượn sách",
          icon: "mdi-clipboard-text-clock-outline",
          to: "/admin/borrows",
        },
      ],
    };
  },
  computed: {
    // 3. Tạo biến trung gian để đồng bộ v-model
    internalDrawer: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      },
    },
  },
};
</script>

<style scoped>
/* Gradient Background sang trọng */
.sidebar-gradient {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
}

/* Hiệu ứng Active cho Item đang chọn */
.active-item-gradient {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  font-weight: bold;
}
</style>
