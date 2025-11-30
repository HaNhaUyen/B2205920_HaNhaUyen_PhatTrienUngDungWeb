<template>
  <div class="p-6 bg-white rounded-xl shadow space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Danh sách Độc giả</h2>
      <v-btn color="primary" @click="openDialog()">Thêm độc giả</v-btn>
    </div>

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

    <v-text-field
      v-model="search"
      label="Tìm kiếm tên hoặc email"
      prepend-inner-icon="mdi-magnify"
      clearable
    />

    <v-table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Địa chỉ</th>
          <th>Giới tính</th>
          <th>Ngày sinh</th>
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
          <td>{{ reader.phai || "" }}</td>
          <td>{{ reader.ngaysinh ? reader.ngaysinh.split("T")[0] : "" }}</td>
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
              class="my-2"
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
          <td colspan="9" class="text-center py-4 text-gray-500">
            Không có độc giả nào.
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
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ "Thêm Độc giả" }}
        </v-card-title>
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
            <Field name="gender" v-slot="{ field, errorMessage, handleBlur }">
              <v-select
                :items="['Nam', 'Nữ']"
                v-bind="field"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Giới tính"
                clearable
              />
            </Field>

            <Field
              name="birthdate"
              v-slot="{ field, errorMessage, handleBlur }"
            >
              <v-text-field
                v-bind="field"
                type="date"
                @blur="handleBlur"
                :error-messages="errorMessage"
                label="Ngày sinh"
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
              <v-btn color="blue-grey" text @click="closeDialog()">Hủy</v-btn>
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

const props = defineProps({
  users: { type: Array, default: () => [] },
});

const emit = defineEmits(["refresh"]);

const message = ref("");
const messageType = ref("");
const dialog = ref(false);
const search = ref("");
const readers = ref([...props.users]);

const currentPage = ref(1);
const itemsPerPage = ref(5);

// Schema — KHÔNG LẶP LẠI
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
  gender: yup.string().required("Vui lòng chọn giới tính"),
  birthdate: yup
    .date()
    .required("Vui lòng chọn ngày sinh")
    .typeError("Ngày sinh không hợp lệ"),
  status: yup.string().required("Vui lòng chọn trạng thái"),
});

// Lọc theo search
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

watch(search, () => (currentPage.value = 1));

function updatePagination() {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1;
  }
}

function openDialog() {
  dialog.value = true;
  setTimeout(() => {
    document.querySelector("form")?.reset();
  }, 50);
}

function closeDialog() {
  dialog.value = false;
}

// SAVE
async function saveReader(values) {
  const payload = {
    ho_ten: values.name,
    email: values.email,
    so_dien_thoai: values.phone,
    dia_chi: values.address,
    mat_khau: values.password,
    trang_thai: values.status === "Khóa" ? "inactive" : "active",
    vai_tro: "reader",
    phai: values.gender,
    ngaysinh: new Date(values.birthdate + "T00:00:00"),
  };

  try {
    const { data } = await api.post("/api/users/register", payload);

    readers.value.unshift(data.user); // có _id
    message.value = "Thêm độc giả thành công!";
    messageType.value = "success";

    emit("refresh");
    dialog.value = false;
  } catch (err) {
    message.value =
      "Có lỗi xảy ra: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}

// DELETE
async function deleteReader(userId) {
  if (!confirm("Bạn có chắc chắn muốn xoá độc giả này không?")) return;

  try {
    await api.delete(`/api/users/${userId}`);
    readers.value = readers.value.filter((r) => r._id !== userId);
    message.value = "Xoá người dùng thành công!";
    messageType.value = "success";
    emit("refresh");
  } catch (err) {
    message.value =
      "Không thể xoá độc giả: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}
</script>
