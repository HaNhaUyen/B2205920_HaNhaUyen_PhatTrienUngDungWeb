<template>
  <div class="p-6 bg-white rounded-xl shadow space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Danh sách quản trị</h2>
      <v-btn color="primary" @click="openDialog()">Thêm quản trị</v-btn>
    </div>

    <!-- Message -->
    <span
      v-if="message"
      :class="{
        'text-green-600': messageType === 'success',
        'text-red-600': messageType === 'error',
        'block text-center mb-4 font-medium': true,
      }"
      >{{ message }}</span
    >

    <!-- Search -->
    <v-text-field
      v-model="search"
      label="Tìm kiếm tên hoặc email"
      prepend-inner-icon="mdi-magnify"
      clearable
      @input="resetPagination"
    />

    <!-- Items per page -->

    <!-- Table -->
    <v-table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Địa chỉ</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(reader, index) in paginatedReaders" :key="reader._id">
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ reader.ho_ten }}</td>
          <td>{{ reader.email }}</td>
          <td>{{ reader.so_dien_thoai || "" }}</td>
          <td>{{ reader.dia_chi || "" }}</td>
          <td>
            <v-chip
              :color="reader.trang_thai === 'active' ? 'green' : 'red'"
              variant="flat"
              size="small"
            >
              {{ reader.trang_thai === "active" ? "Hoạt động" : "Khoá" }}
            </v-chip>
          </td>
          <td>
            <v-btn
              color="blue"
              class="mr-2 my-2"
              icon
              @click="$router.push(`/admin/users/edit/${reader._id}`)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteReader(reader._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
        <tr v-if="paginatedReaders.length === 0">
          <td colspan="7" class="text-center py-4 text-gray-500">
            Không có quản trị nào.
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
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

    <!-- Dialog thêm -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2"
          >Thêm quản trị</v-card-title
        >
        <v-card-text>
          <Form @submit="saveReader" :validation-schema="readerSchema">
            <Field name="name" v-slot="{ field, errorMessage, handleBlur }">
              <v-text-field
                v-bind="field"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Tên"
                clearable
              />
            </Field>
            <Field name="email" v-slot="{ field, errorMessage, handleBlur }">
              <v-text-field
                v-bind="field"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Email"
                clearable
              />
            </Field>
            <Field name="phone" v-slot="{ field, errorMessage, handleBlur }">
              <v-text-field
                v-bind="field"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Số điện thoại"
                clearable
              />
            </Field>
            <Field name="address" v-slot="{ field, errorMessage, handleBlur }">
              <v-text-field
                v-bind="field"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Địa chỉ"
                clearable
              />
            </Field>
            <Field name="password" v-slot="{ field, errorMessage, handleBlur }">
              <v-text-field
                v-bind="field"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Mật khẩu"
                type="password"
                clearable
              />
            </Field>
            <Field name="status" v-slot="{ field, errorMessage, handleBlur }">
              <v-select
                :items="['Hoạt động', 'Khóa']"
                v-bind="field"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Trạng thái"
                clearable
              />
            </Field>

            <v-card-actions>
              <v-spacer />
              <v-btn color="blue-grey" text @click="closeDialog">Hủy</v-btn>
              <v-btn color="primary" type="submit">Lưu</v-btn>
            </v-card-actions>
          </Form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Field, Form } from "vee-validate";
import * as yup from "yup";
import api from "@/services/api.service";

const props = defineProps({ users: { type: Array, default: () => [] } });
const emit = defineEmits(["refresh"]); // Định nghĩa emit

const message = ref("");
const messageType = ref("");
const dialog = ref(false);
const search = ref("");
const readers = ref([...props.users]);

// === QUAN TRỌNG: Thêm watch để cập nhật danh sách khi props thay đổi ===
watch(
  () => props.users,
  (newUsers) => {
    readers.value = [...newUsers];
  }
);
// ======================================================================

const currentPage = ref(1);
const itemsPerPage = ref(5);

// ... (Giữ nguyên phần Schema validation) ...
const readerSchema = yup.object({
  name: yup
    .string()
    .required("Vui lòng nhập tên")
    .min(6, "Tên tối thiểu 6 ký tự"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  phone: yup.string().nullable(),
  address: yup.string().nullable(),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Tối thiểu 6 ký tự"),
  status: yup.string().required("Vui lòng chọn trạng thái"),
});

// ... (Giữ nguyên phần Computed & Watch search) ...
const filteredReaders = computed(() =>
  readers.value.filter((r) =>
    (r.ho_ten + r.email).toLowerCase().includes(search.value.toLowerCase())
  )
);

const totalPages = computed(() =>
  Math.ceil(filteredReaders.value.length / itemsPerPage.value)
);

const paginatedReaders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredReaders.value.slice(start, start + itemsPerPage.value);
});

watch(search, resetPagination);

function resetPagination() {
  currentPage.value = 1;
}

function updatePagination() {
  if (currentPage.value > totalPages.value)
    currentPage.value = totalPages.value || 1;
}

function openDialog() {
  dialog.value = true;
}
function closeDialog() {
  dialog.value = false;
}

async function saveReader(values) {
  const payload = {
    ho_ten: values.name,
    email: values.email,
    so_dien_thoai: values.phone,
    dia_chi: values.address,
    mat_khau: values.password,
    trang_thai: values.status === "Khóa" ? "inactive" : "active",
    vai_tro: "admin",
  };
  try {
    const res = await api.post("/api/users/register", payload);
    message.value = "Thêm quản trị thành công!";
    messageType.value = "success";

    // 1. Thêm vào danh sách hiện tại ngay lập tức
    readers.value.unshift(res.data);

    // 2. Yêu cầu cha đồng bộ lại dữ liệu
    emit("refresh");

    closeDialog();
  } catch (err) {
    message.value =
      "Có lỗi xảy ra khi lưu quản trị: " +
      (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}

async function deleteReader(userId) {
  if (!confirm("Bạn có chắc chắn muốn xoá quản trị này không?")) return;
  try {
    await api.delete(`/api/users/${userId}`);

    // Xóa khỏi danh sách hiện tại ngay lập tức
    readers.value = readers.value.filter((r) => r._id !== userId);

    message.value = "Xoá người dùng thành công!";
    messageType.value = "success";

    // Yêu cầu cha đồng bộ lại
    emit("refresh");
  } catch (err) {
    message.value =
      "Không thể xoá quản trị: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}
</script>
