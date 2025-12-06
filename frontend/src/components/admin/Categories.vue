<template>
  <div class="p-6 bg-white rounded-xl shadow space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Quản lý Thể loại</h2>
      <v-btn color="primary" @click="openDialog()">Thêm thể loại</v-btn>
    </div>

    <!-- Thông báo -->
    <span
      v-if="message"
      :class="{
        'text-green-600': messageType === 'success',
        'text-red-600': messageType === 'error',
        'block text-center mb-4 font-medium': true,
      }"
    >
      {{ message }}
    </span>

    <!-- Toolbar: Tìm kiếm + Tổng số lượng (GIAO DIỆN MỚI GIỐNG HÌNH) -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <!-- Ô tìm kiếm (bên trái) -->
      <div class="w-full sm:w-96">
        <v-text-field
          v-model="search"
          placeholder="Tìm kiếm thể loại..."
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          hide-details
          rounded="lg"
          bg-color="white"
          clearable
        />
      </div>

      <!-- Chip hiển thị tổng số (bên phải - style nút xanh) -->
      <div
        class="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-sm whitespace-nowrap"
      >
        Tổng: {{ filteredCategories.length }} thể loại
      </div>
    </div>

    <!-- Bảng dữ liệu -->
    <v-table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên thể loại</th>
          <th>Mô tả</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(category, index) in paginatedCategories"
          :key="category._id"
        >
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ category.ten_the_loai }}</td>
          <td>{{ category.mo_ta }}</td>
          <td>
            <v-btn
              icon
              color="blue"
              class="my-2 mr-2"
              @click="$router.push(`/admin/categories/edit/${category._id}`)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteCategory(category._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
        <tr v-if="paginatedCategories.length === 0">
          <td colspan="4" class="text-center py-4 text-gray-500">
            Không có thể loại nào.
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Phân trang -->
    <v-row class="mt-4">
      <v-col cols="12" class="flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          rounded
          @update:modelValue="updatePagination"
        />
      </v-col>
    </v-row>

    <!-- Dialog Thêm/Sửa -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ "Thêm Thể loại" }}
        </v-card-title>
        <v-card-text>
          <Form
            @submit="saveCategory"
            :validation-schema="categorySchema"
            :initial-values="initialValues"
          >
            <Field name="name" v-slot="{ field, errorMessage }">
              <v-text-field
                v-bind="field"
                :error-messages="errorMessage"
                label="Tên thể loại"
              />
            </Field>
            <Field name="description" v-slot="{ field, errorMessage }">
              <v-textarea
                v-bind="field"
                :error-messages="errorMessage"
                label="Mô tả"
                auto-grow
                outlined
                color="black"
                class="mb-2"
                :model-value="field.value"
                @update:model-value="field.value = $event"
              />
            </Field>

            <v-card-actions>
              <v-spacer />
              <v-btn text @click="closeDialog">Hủy</v-btn>
              <v-btn color="primary" type="submit">Lưu</v-btn>
            </v-card-actions>
          </Form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import api from "@/services/api.service";

const dialog = ref(false);
const search = ref("");
const message = ref("");
const messageType = ref("");
const categories = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);

const initialValues = ref({ name: "" });

const categorySchema = yup.object({
  name: yup.string().required("Vui lòng nhập tên thể loại"),
});

// Lọc danh sách
const filteredCategories = computed(() =>
  categories.value.filter((c) =>
    c.ten_the_loai.toLowerCase().includes(search.value.toLowerCase())
  )
);

// Tổng số trang
const totalPages = computed(() =>
  Math.ceil(filteredCategories.value.length / itemsPerPage.value)
);

// Danh sách theo trang
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCategories.value.slice(start, start + itemsPerPage.value);
});

// Reset currentPage khi search hoặc itemsPerPage thay đổi
watch(search, () => (currentPage.value = 1));
function resetPagination() {
  currentPage.value = 1;
}

// Đảm bảo currentPage <= totalPages
function updatePagination() {
  if (currentPage.value > totalPages.value)
    currentPage.value = totalPages.value || 1;
}

// API
async function fetchCategories() {
  try {
    const res = await api.get("/api/categories");
    categories.value = res.data.reverse();
  } catch (err) {
    console.error(
      "Lỗi khi lấy danh sách thể loại:",
      err.response?.data?.message || err.message
    );
  }
}

async function saveCategory(values) {
  try {
    const payload = { ten_the_loai: values.name, mo_ta: values.description };
    await api.post("/api/categories", payload);
    message.value = "Thêm thể loại thành công!";
    messageType.value = "success";
    await fetchCategories();
    closeDialog();
  } catch (err) {
    message.value = "Lỗi: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}

async function deleteCategory(id) {
  if (confirm("Bạn có chắc chắn muốn xoá thể loại này?")) {
    try {
      await api.delete(`/api/categories/${id}`);
      message.value = "Xoá thành công!";
      messageType.value = "success";
      await fetchCategories();
    } catch (err) {
      message.value =
        "Lỗi khi xoá: " + (err.response?.data?.message || err.message);
      messageType.value = "error";
    }
  }
}

function openDialog() {
  initialValues.value = { name: "" };
  dialog.value = true;
}
function closeDialog() {
  dialog.value = false;
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.v-table th,
.v-table td {
  padding: 12px;
}
</style>
