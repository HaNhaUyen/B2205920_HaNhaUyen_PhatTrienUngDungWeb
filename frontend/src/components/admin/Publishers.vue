<template>
  <div class="p-6 bg-white rounded-xl shadow space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Quản lý Nhà Xuất Bản</h2>
      <v-btn color="primary" @click="openDialog()">Thêm NXB</v-btn>
    </div>

    <v-text-field
      v-model="search"
      label="Tìm kiếm NXB"
      prepend-inner-icon="mdi-magnify"
      clearable
    />

    <v-table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên NXB</th>
          <th>Địa chỉ</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(publisher, index) in paginatedPublishers"
          :key="publisher._id"
        >
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ publisher.ten_nxb }}</td>
          <td>{{ publisher.dia_chi }}</td>
          <td>
            <v-btn
              icon
              color="blue"
              class="my-2 mr-2"
              @click="$router.push(`/admin/publishers/edit/${publisher._id}`)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deletePublisher(publisher._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
        <tr v-if="paginatedPublishers.length === 0">
          <td colspan="4" class="text-center py-4 text-gray-500">
            Không có NXB nào.
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
          {{ "Thêm NXB" }}
        </v-card-title>
        <v-card-text>
          <Form
            @submit="savePublisher"
            :validation-schema="publisherSchema"
            v-slot="{ setFieldError }"
          >
            <Field name="name" v-slot="{ field, errorMessage }">
              <v-text-field
                v-bind="field"
                :error-messages="errorMessage"
                label="Tên NXB"
              />
            </Field>
            <Field name="address" v-slot="{ field, errorMessage }">
              <v-text-field
                v-bind="field"
                :error-messages="errorMessage"
                label="Địa chỉ"
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
const publishers = ref([]);

const currentPage = ref(1);
const itemsPerPage = ref(5);

const publisherSchema = yup.object({
  name: yup.string().required("Vui lòng nhập tên NXB"),
  address: yup.string().required("Vui lòng nhập địa chỉ"),
});

// Lọc danh sách theo search
const filteredPublishers = computed(() =>
  publishers.value.filter(
    (p) =>
      p.ten_nxb.toLowerCase().includes(search.value.toLowerCase()) ||
      p.dia_chi.toLowerCase().includes(search.value.toLowerCase())
  )
);

const totalPages = computed(() =>
  Math.ceil(filteredPublishers.value.length / itemsPerPage.value)
);

const paginatedPublishers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredPublishers.value.slice(start, start + itemsPerPage.value);
});

watch(search, () => (currentPage.value = 1));
function resetPagination() {
  currentPage.value = 1;
}
function updatePagination() {
  if (currentPage.value > totalPages.value)
    currentPage.value = totalPages.value || 1;
}

// API
async function fetchPublishers() {
  try {
    const res = await api.get("/api/publishers");
    publishers.value = res.data.reverse();
  } catch (err) {
    console.error(
      "Lỗi khi lấy danh sách NXB:",
      err.response?.data?.message || err.message
    );
  }
}

async function savePublisher(values, { setFieldError }) {
  try {
    const payload = { ten_nxb: values.name, dia_chi: values.address };

    // Kiểm tra trùng tên trước khi gửi request
    const exists = publishers.value.find(
      (p) => p.ten_nxb.toLowerCase() === values.name.trim().toLowerCase()
    );
    if (exists) {
      setFieldError("name", "Tên NXB đã tồn tại!");
      return;
    }

    await api.post("/api/publishers", payload);

    // Tự động đóng dialog và reset form
    setTimeout(() => closeDialog(), 300);

    await fetchPublishers();
  } catch (err) {
    setFieldError(
      "name",
      "Lỗi: " + (err.response?.data?.message || err.message)
    );
  }
}

async function deletePublisher(id) {
  if (confirm("Bạn có chắc chắn muốn xoá NXB này?")) {
    try {
      await api.delete(`/api/publishers/${id}`);
      await fetchPublishers();
    } catch (err) {
      console.error("Lỗi khi xoá:", err.response?.data?.message || err.message);
    }
  }
}

function openDialog() {
  dialog.value = true;
}
function closeDialog() {
  dialog.value = false;
}

onMounted(() => {
  fetchPublishers();
});
</script>
