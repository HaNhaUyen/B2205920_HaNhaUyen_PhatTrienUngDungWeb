<template>
  <div class="bg-grey-lighten-5 min-h-screen">
    <v-container class="py-10">
      <v-row justify="center">
        <v-col cols="12" lg="11">
          <!-- Header -->
          <div class="d-flex align-center justify-space-between mb-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-blue-grey-darken-3">
                Quản lý Đánh giá & Bình luận
              </h2>
              <p class="text-subtitle-1 text-grey-darken-1 mt-1">
                Xem và kiểm duyệt ý kiến từ độc giả
              </p>
            </div>
            <v-avatar color="amber-darken-2" variant="tonal" size="56">
              <v-icon size="32">mdi-star-face</v-icon>
            </v-avatar>
          </div>

          <!-- Main Card -->
          <v-card elevation="3" class="rounded-xl overflow-hidden border-thin">
            <!-- Toolbar & Search -->
            <v-toolbar color="white" flat class="px-4 border-b h-auto py-3">
              <v-text-field
                v-model="search"
                density="compact"
                variant="outlined"
                label="Tìm kiếm theo tên sách, độc giả hoặc nội dung..."
                prepend-inner-icon="mdi-magnify"
                hide-details
                single-line
                class="max-w-md"
                bg-color="grey-lighten-5"
                clearable
              ></v-text-field>
              <v-spacer></v-spacer>
              <v-chip color="primary" variant="flat" class="font-weight-bold">
                Tổng: {{ filteredComments.length }} đánh giá
              </v-chip>
            </v-toolbar>

            <!-- Table -->
            <v-data-table
              :headers="headers"
              :items="paginatedComments"
              :loading="loading"
              class="pa-2 custom-table"
              hover
            >
              <!-- Ẩn footer mặc định -->
              <template v-slot:bottom></template>

              <!-- ✅ CỘT 1: ẢNH BÌA -->
              <template v-slot:item.book_img="{ item }">
                <v-img
                  :src="item.book?.anh_bia"
                  width="45"
                  height="70"
                  cover
                  class="rounded elevation-2 bg-grey-lighten-3 my-1"
                ></v-img>
              </template>

              <!-- ✅ CỘT 2: TÊN SÁCH -->
              <template v-slot:item.book_name="{ item }">
                <div
                  class="font-weight-bold text-body-2 text-blue-grey-darken-4 line-clamp-2"
                  :title="item.book?.ten_sach"
                >
                  {{ item.book?.ten_sach }}
                </div>
              </template>

              <!-- Slot: Thông tin độc giả -->
              <template v-slot:item.user="{ item }">
                <div class="d-flex flex-column">
                  <span class="font-weight-medium text-body-2">{{
                    item.user?.ho_ten
                  }}</span>
                  <span class="text-caption text-grey">{{
                    item.user?.email
                  }}</span>
                </div>
              </template>

              <!-- Slot: Đánh giá (Sao) -->
              <template v-slot:item.ti_le="{ item }">
                <v-rating
                  :model-value="item.ti_le"
                  color="amber"
                  density="compact"
                  half-increments
                  readonly
                  size="small"
                ></v-rating>
              </template>

              <!-- Slot: Nội dung -->
              <template v-slot:item.noi_dung="{ item }">
                <v-tooltip location="top" activator="parent" max-width="400">
                  {{ item.noi_dung }}
                </v-tooltip>
                <div class="text-body-2 text-grey-darken-3 line-clamp-2">
                  {{ item.noi_dung }}
                </div>
              </template>

              <!-- Slot: Ngày tạo -->
              <template v-slot:item.ngay_tao="{ item }">
                <div class="text-caption text-grey-darken-1">
                  {{ formatDate(item.ngay_tao) }}
                </div>
              </template>

              <!-- Slot: Hành động -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  color="red-lighten-1"
                  size="small"
                  @click="deleteComment(item._id)"
                >
                  <v-tooltip location="top" activator="parent"
                    >Xóa bình luận</v-tooltip
                  >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </template>

              <!-- No Data -->
              <template v-slot:no-data>
                <div class="py-8 text-center text-grey">
                  Không có bình luận nào.
                </div>
              </template>
            </v-data-table>
          </v-card>

          <!-- PHÂN TRANG -->
          <v-row class="mt-4">
            <v-col cols="12" class="flex justify-center">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                rounded
                active-color="primary"
                color="grey-lighten-2"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/services/api.service";

const comments = ref([]);
const search = ref("");
const loading = ref(false);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("");

// --- 1. Cấu hình phân trang ---
const currentPage = ref(1);
const itemsPerPage = ref(5);

// ✅ CẬP NHẬT HEADERS: Tách cột sách thành 2
const headers = [
  {
    title: "Ảnh",
    key: "book_img",
    align: "center",
    width: "80px",
    sortable: false,
  },
  { title: "Tên sách", key: "book_name", align: "start", width: "20%" },
  { title: "Độc giả", key: "user", align: "start", width: "20%" },
  { title: "Đánh giá", key: "ti_le", align: "start", width: "120px" },
  { title: "Nội dung", key: "noi_dung", align: "start" },
  { title: "Ngày đăng", key: "ngay_tao", align: "end", width: "110px" },
  {
    title: "Xóa",
    key: "actions",
    align: "center",
    sortable: false,
    width: "60px",
  },
];

// --- 2. Tải dữ liệu ---
const fetchComments = async () => {
  loading.value = true;
  try {
    const res = await api.get("/api/comments");
    // Sort mới nhất lên đầu
    comments.value = res.data.sort(
      (a, b) => new Date(b.ngay_tao) - new Date(a.ngay_tao)
    );
  } catch (error) {
    showSnackbar("Lỗi tải danh sách bình luận", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchComments);

// --- 3. Logic Lọc và Phân trang ---

const filteredComments = computed(() => {
  if (!search.value) return comments.value;
  const q = search.value.toLowerCase();
  return comments.value.filter((c) => {
    return (
      c.book?.ten_sach?.toLowerCase().includes(q) ||
      c.user?.ho_ten?.toLowerCase().includes(q) ||
      c.noi_dung?.toLowerCase().includes(q)
    );
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredComments.value.length / itemsPerPage.value)
);

const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredComments.value.slice(start, start + itemsPerPage.value);
});

watch(search, () => {
  currentPage.value = 1;
});

// --- 4. Các chức năng khác ---

const deleteComment = async (id) => {
  if (
    !confirm(
      "Bạn chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
    )
  )
    return;

  try {
    await api.delete(`/api/comments/${id}`);
    comments.value = comments.value.filter((c) => c._id !== id);
    showSnackbar("Đã xóa bình luận thành công", "success");

    if (paginatedComments.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    showSnackbar("Lỗi khi xóa bình luận", "error");
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const showSnackbar = (text, color) => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-table :deep(th) {
  font-weight: 700 !important;
  color: #37474f !important;
  text-transform: uppercase;
  font-size: 0.8rem;
}
</style>
