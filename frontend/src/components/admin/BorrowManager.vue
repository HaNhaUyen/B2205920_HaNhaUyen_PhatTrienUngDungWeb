<template>
  <div class="p-6 bg-white rounded-xl shadow space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Quản lý Mượn Sách</h2>
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
      label="Tìm kiếm theo độc giả hoặc tên sách"
      prepend-inner-icon="mdi-magnify"
      clearable
    />

    <!-- Table -->
    <v-table>
      <thead>
        <tr>
          <th>#</th>
          <th>Độc giả</th>
          <th>Tên sách</th>
          <th>Ngày mượn</th>
          <th>Hạn trả</th>
          <th>Ngày trả thực</th>
          <th>Số lượng</th>
          <th>Tiền phạt</th>
          <th class="text-center">Trạng thái</th>
          <th>Duyệt/ Trả</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(borrow, index) in paginatedBorrows" :key="borrow._id">
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ borrow.docgia.ho_ten }}</td>
          <td>{{ borrow.sach.ten_sach }}</td>
          <td>{{ formatDate(borrow.ngay_muon) }}</td>

          <!-- Hạn trả (Tự động tính +14 ngày nếu thiếu) -->
          <td>{{ formatDate(calculateDueDate(borrow)) }}</td>

          <td>
            {{
              borrow.ngay_tra_thuc_te
                ? formatDate(borrow.ngay_tra_thuc_te)
                : borrow.ngay_tra
                ? formatDate(borrow.ngay_tra)
                : "---"
            }}
          </td>
          <td>{{ borrow.so_luong ?? 1 }}</td>
          <!-- Tiền phạt: Gọi hàm tính toán để hiển thị realtime -->
          <td>
            <span
              :class="{
                'text-red-600 font-bold': calculateFine(borrow) > 0,
                'text-gray-500': calculateFine(borrow) === 0,
              }"
            >
              {{ formatCurrency(calculateFine(borrow)) }}
            </span>
          </td>

          <td class="text-center">
            <v-chip
              class="font-bold"
              :color="
                borrow.trang_thai === 'borrowing'
                  ? 'blue'
                  : borrow.trang_thai === 'pending'
                  ? 'red'
                  : 'green'
              "
              variant="flat"
            >
              {{
                borrow.trang_thai === "pending"
                  ? "Chờ duyệt"
                  : borrow.trang_thai === "borrowing"
                  ? "Đang mượn"
                  : "Đã trả"
              }}
            </v-chip>
          </td>
          <td class="text-center">
            <v-btn
              v-if="borrow.trang_thai === 'pending'"
              color="warning"
              size="small"
              class="text-white font-bold"
              @click="handleApprove(borrow._id)"
            >
              <v-icon size="18" class="mr-1">mdi-check</v-icon> Duyệt
            </v-btn>
            <v-btn
              v-else
              color="success"
              size="small"
              class="text-white font-bold"
              @click="handleReturn(borrow._id)"
              :disabled="borrow.trang_thai !== 'borrowing'"
            >
              <v-icon size="18" class="mr-1">mdi-check</v-icon> Trả sách
            </v-btn>
          </td>
          <td>
            <v-btn
              class="my-1"
              icon
              color="blue"
              @click="$router.push(`/admin/borrows/edit/${borrow._id}`)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              class="my-1"
              color="red"
              @click="deleteBorrow(borrow._id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
        <tr v-if="paginatedBorrows.length === 0">
          <td colspan="10" class="text-center py-4 text-gray-500">
            Không có bản ghi nào.
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
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/services/api.service";

const borrows = ref([]);
const search = ref("");
const message = ref("");
const messageType = ref("");

// Phân trang mặc định
const currentPage = ref(1);
const itemsPerPage = ref(5);

const fetchBorrows = async () => {
  try {
    const res = await api.get("/api/borrows");
    borrows.value = res.data.reverse();
  } catch (err) {
    message.value = "Lỗi khi tải dữ liệu";
    messageType.value = "error";
  }
};

onMounted(fetchBorrows);

// Lọc dữ liệu
const filteredBorrows = computed(() => {
  const q = search.value.toLowerCase();
  return borrows.value.filter(
    (b) =>
      b.docgia.ho_ten.toLowerCase().includes(q) ||
      b.sach.ten_sach.toLowerCase().includes(q)
  );
});

// Dữ liệu phân trang
const paginatedBorrows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredBorrows.value.slice(start, start + itemsPerPage.value);
});

// Tổng số trang
const totalPages = computed(() =>
  Math.ceil(filteredBorrows.value.length / itemsPerPage.value)
);

// Reset trang khi search
watch(search, () => {
  currentPage.value = 1;
});

// --- HELPER FUNCTIONS ---

function formatCurrency(value) {
  if (!value) return "0 đ";
  return value.toLocaleString("vi-VN") + " đ";
}

function formatDate(dateStr) {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

// Tính hạn trả (Nếu null thì +14 ngày từ ngày mượn)
function calculateDueDate(borrow) {
  if (borrow.han_tra) {
    return borrow.han_tra;
  }
  if (borrow.ngay_muon) {
    const borrowDate = new Date(borrow.ngay_muon);
    const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    return dueDate.toISOString();
  }
  return null;
}

// Tính tiền phạt (Logic: 5000đ / ngày trễ)
function calculateFine(borrow) {
  // 1. Nếu trạng thái là Pending, chưa tính phạt
  if (borrow.trang_thai === "pending") return 0;

  // 2. Lấy hạn trả chuẩn
  const dueDateStr = calculateDueDate(borrow);
  if (!dueDateStr) return 0;

  const dueDate = new Date(dueDateStr);
  let returnDate;

  // 3. Xác định ngày để so sánh
  // Nếu đã trả (returned): dùng ngày trả thực tế
  if (borrow.trang_thai === "returned") {
    const realReturnDate = borrow.ngay_tra_thuc_te || borrow.ngay_tra;
    if (!realReturnDate) return 0; // Đã trả mà ko có ngày -> coi như không phạt
    returnDate = new Date(realReturnDate);
  } else {
    // Nếu đang mượn (borrowing): dùng ngày hiện tại để tính phạt dự kiến
    returnDate = new Date();
  }

  // Reset giờ phút giây để tính ngày chẵn
  dueDate.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  // 4. Tính chênh lệch
  if (returnDate <= dueDate) return 0;

  const diffTime = returnDate - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays * 5000;
}

// --- ACTIONS ---

async function handleReturn(borrowId) {
  try {
    const today = new Date().toISOString();

    await api.put(`/api/borrows/${borrowId}/return`, {
      returnDate: today,
      ngay_tra_thuc_te: today,
    });

    message.value = "Trả sách thành công!";
    messageType.value = "success";
    await fetchBorrows();
  } catch (err) {
    message.value =
      "Lỗi khi trả sách: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}

async function handleApprove(borrowId) {
  try {
    await api.put(`/api/borrows/${borrowId}/approve`, {
      trang_thai: "borrowing",
    });
    message.value = "Duyệt đăng ký mượn thành công!";
    messageType.value = "success";
    await fetchBorrows();
  } catch (err) {
    message.value =
      "Lỗi khi duyệt mượn: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}

async function deleteBorrow(id) {
  if (!confirm("Bạn có chắc muốn xoá bản ghi này?")) return;
  try {
    await api.delete(`/api/borrows/${id}`);
    message.value = "Xoá thành công!";
    messageType.value = "success";
    await fetchBorrows();
  } catch (err) {
    message.value =
      "Lỗi khi xoá: " + (err.response?.data?.message || err.message);
    messageType.value = "error";
  }
}
</script>

<style scoped>
.v-table th,
.v-table td {
  padding: 12px;
}
</style>
