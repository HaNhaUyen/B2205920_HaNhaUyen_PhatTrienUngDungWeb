<template>
  <v-container class="py-6">
    <v-row class="align-center mb-4" no-gutters>
      <v-col cols="auto">
        <h3 class="font-weight-bold text-h5 text-primary">
          <v-icon start>mdi-bookshelf</v-icon>
          Khám Phá Danh Mục
        </h3>
      </v-col>

      <v-spacer />

      <v-col cols="auto">
        <v-btn
          variant="text"
          color="primary"
          size="small"
          class="text-none font-weight-medium"
          @click="viewAllCategories"
        >
          Xem tất cả
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-slide-group show-arrows>
      <v-slide-group-item v-for="category in categories" :key="category._id">
        <v-chip
          :class="['ma-2 category-chip']"
          :color="
            route.query.category === category._id ? 'primary' : 'grey-darken-1'
          "
          :variant="route.query.category === category._id ? 'flat' : 'tonal'"
          pill
          size="large"
          @click="selectCategory(category._id)"
        >
          {{ category.ten_the_loai }}
        </v-chip>
      </v-slide-group-item>
    </v-slide-group>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/api.service";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const categories = ref([]);

// Logic chọn danh mục
const selectCategory = (id) => {
  // Nếu category hiện tại đã chọn, thì BỎ CHỌN (clearCategory)
  if (route.query.category === id) {
    clearCategory();
  } else {
    // Ngược lại, thêm ID vào query
    const query = { ...route.query, category: id };
    router.push({ query });
  }
};

// 2. Logic xóa bộ lọc: Xóa tham số category khỏi URL
const clearCategory = () => {
  const query = { ...route.query };
  delete query.category;
  router.push({ query });
};

const viewAllCategories = () => {
  // Thay vì dùng tên route, bạn dùng path trực tiếp:
  router.push("/books");
};

// 4. Fetch API để lấy danh sách categories
const fetchCategories = async () => {
  try {
    const response = await api.get("/api/categories");
    categories.value = response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thể loại:", error);
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
/* Tùy chỉnh chip */
.category-chip {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  font-weight: 500;
}

.category-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-chip--variant-flat.bg-primary {
  font-weight: 700 !important; /* In đậm chữ khi chip active */
  transform: scale(1.03);
}
</style>
