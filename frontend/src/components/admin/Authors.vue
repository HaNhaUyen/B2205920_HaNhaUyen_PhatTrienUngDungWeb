<template>
  <div class="p-6 bg-white rounded-xl shadow space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Quản lý Tác giả</h2>
      <v-btn color="primary" @click="openDialog()">Thêm tác giả</v-btn>
    </div>

    <!-- Message -->
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

    <!-- Search -->
    <v-text-field
      v-model="search"
      label="Tìm kiếm tên tác giả"
      prepend-inner-icon="mdi-magnify"
      @input="currentPage = 1"
    />

    <!-- Table -->
    <v-table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên tác giả</th>
          <th>Quốc tịch</th>
          <th>Tiểu sử</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(author, index) in paginatedAuthors" :key="author._id">
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ author.ho_ten }}</td>
          <td>{{ author.quoc_tich }}</td>
          <td>{{ author.tieu_su }}</td>
          <td>
            <v-btn
              icon
              color="blue"
              class="my-2"
              @click="$router.push(`/admin/authors/edit/${author._id}`)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteAuthor(author._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Phân trang giống BookCatalog -->
    <v-row class="mt-10">
      <v-col cols="12" class="flex justify-center items-center space-x-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          density="comfortable"
          rounded="circle"
          active-color="gray-900"
        ></v-pagination>
      </v-col>
    </v-row>

    <!-- Dialog thêm tác giả -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Thêm Tác giả
        </v-card-title>
        <v-card-text>
          <Form @submit="saveAuthor" :validation-schema="authorSchema">
            <Field name="name" v-slot="{ field, errorMessage }">
              <v-text-field
                v-bind="field"
                :error-messages="errorMessage"
                label="Tên tác giả"
                clearable
              />
            </Field>
            <Field name="nationality" v-slot="{ field, errorMessage }">
              <v-text-field
                v-bind="field"
                :error-messages="errorMessage"
                label="Quốc tịch"
              />
            </Field>
            <Field name="biography" v-slot="{ field, errorMessage }">
              <v-textarea
                v-bind="field"
                :error-messages="errorMessage"
                label="Tiểu sử"
                rows="4"
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
import { ref, computed, onMounted } from "vue";
import { Field, Form } from "vee-validate";
import * as yup from "yup";
import api from "@/services/api.service";

const dialog = ref(false);
const search = ref("");
const itemsPerPage = ref(5);
const currentPage = ref(1);

const message = ref("");
const messageType = ref("");

// Yup validation schema
const authorSchema = yup.object({
  name: yup.string().required("Vui lòng nhập tên tác giả"),
  biography: yup.string().nullable(),
  nationality: yup.string().required("Vui lòng nhập quốc tịch tác giả"),
});

// Danh sách tác giả
const authors = ref([]);

// Lọc và phân trang
const filteredAuthors = computed(() =>
  authors.value.filter((author) =>
    author.ho_ten.toLowerCase().includes(search.value.toLowerCase())
  )
);

const totalPages = computed(() =>
  Math.ceil(filteredAuthors.value.length / itemsPerPage.value)
);

const paginatedAuthors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAuthors.value.slice(start, end);
});

// Mở / đóng dialog
function openDialog() {
  dialog.value = true;
}
function closeDialog() {
  dialog.value = false;
}

// Thêm tác giả
async function saveAuthor(values) {
  try {
    const payload = {
      ho_ten: values.name,
      tieu_su: values.biography,
      quoc_tich: values.nationality,
    };
    await api.post("/api/authors", payload);
    message.value = "Thêm tác giả thành công!";
    messageType.value = "success";
    await fetchAuthors();
    closeDialog();
  } catch (err) {
    message.value =
      "Lỗi khi lưu tác giả: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}

// Xóa tác giả
async function deleteAuthor(id) {
  if (confirm("Bạn có chắc chắn muốn xoá tác giả này?")) {
    try {
      await api.delete(`/api/authors/${id}`);
      message.value = "Xoá tác giả thành công!";
      messageType.value = "success";
      await fetchAuthors();
    } catch (err) {
      message.value =
        "Lỗi khi xoá tác giả: " + (err.response?.data?.message || err.message);
      messageType.value = "error";
    }
  }
}

// Lấy danh sách tác giả
async function fetchAuthors() {
  try {
    const res = await api.get("/api/authors");
    authors.value = res.data.reverse();
  } catch (err) {
    console.error(
      "Lỗi khi lấy danh sách tác giả:",
      err.response?.data?.message || err.message
    );
  }
}

onMounted(() => {
  fetchAuthors();
});
</script>
