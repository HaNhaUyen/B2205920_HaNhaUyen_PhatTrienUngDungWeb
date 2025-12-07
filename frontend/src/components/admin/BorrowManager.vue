<template>
  <div
    class="p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-6"
  >
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">
          Quản lý Mượn Sách & Sự Cố
        </h2>
        <p class="text-gray-500 text-sm mt-1">
          Theo dõi phiếu mượn, trả sách và xử lý vi phạm
        </p>
      </div>
      <div
        class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm"
      >
        Tổng: {{ filteredBorrows.length }} phiếu
      </div>
    </div>

    <!-- Message Alert -->
    <v-fade-transition>
      <v-alert
        v-if="message"
        :type="messageType"
        variant="tonal"
        class="mb-0 font-weight-medium rounded-lg"
        closable
        density="compact"
        @click:close="message = ''"
      >
        {{ message }}
      </v-alert>
    </v-fade-transition>

    <!-- Toolbar -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-3 rounded-lg"
    >
      <div class="w-full sm:w-1/2">
        <v-text-field
          v-model="search"
          placeholder="Tìm kiếm độc giả, tên sách, trạng thái..."
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          hide-details
          bg-color="white"
          color="primary"
          rounded="lg"
          clearable
        />
      </div>
    </div>

    <!-- Table -->
    <v-table hover class="rounded-lg overflow-hidden border">
      <thead class="bg-gray-100">
        <tr>
          <th class="font-bold text-gray-700">#</th>
          <th class="font-bold text-gray-700">Độc giả</th>
          <th class="font-bold text-gray-700">Tên sách</th>
          <!-- ✅ ĐÃ TÁCH THÀNH 3 CỘT -->
          <th class="font-bold text-gray-700">Ngày mượn</th>
          <th class="font-bold text-gray-700">Hạn trả</th>
          <th class="font-bold text-gray-700">Ngày trả thực</th>

          <th class="font-bold text-gray-700">Chi phí</th>
          <th class="font-bold text-gray-700 text-center">Trạng thái</th>
          <th class="font-bold text-gray-700">Sự cố / PA</th>
          <th class="font-bold text-gray-700 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(borrow, index) in paginatedBorrows"
          :key="borrow._id"
          class="transition-colors hover:bg-gray-50"
        >
          <td class="text-gray-500">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </td>

          <!-- Độc giả -->
          <td>
            <div class="font-semibold text-gray-800">
              {{ borrow.docgia?.ho_ten }}
            </div>
            <div v-if="borrow.docgia?.bi_khoa" class="flex items-center mt-1">
              <v-icon size="12" color="red" class="mr-1">mdi-lock</v-icon>
              <span class="text-[10px] text-red-600 font-bold uppercase"
                >Bị khóa</span
              >
            </div>
          </td>

          <!-- Sách -->
          <td class="max-w-[200px] truncate" :title="borrow.sach?.ten_sach">
            {{ borrow.sach?.ten_sach }}
          </td>

          <!-- ✅ CỘT 1: NGÀY MƯỢN -->
          <td class="text-gray-600">
            {{ formatDate(borrow.ngay_muon) }}
          </td>

          <!-- ✅ CỘT 2: HẠN TRẢ (DỰ KIẾN HOẶC HẠN XỬ LÝ) -->
          <td>
            <div
              v-if="borrow.trang_thai === 'gap_su_co'"
              class="text-red-600 font-bold"
            >
              {{ formatDate(borrow.han_xu_ly) }}
              <div class="text-[10px]">(Hạn xử lý)</div>
            </div>
            <div v-else class="text-gray-600 font-medium">
              {{ formatDate(calculateDueDate(borrow)) }}
            </div>
          </td>

          <!-- ✅ CỘT 3: NGÀY TRẢ THỰC -->
          <td>
            <span
              v-if="borrow.ngay_tra_thuc_te"
              class="text-green-600 font-bold"
            >
              {{ formatDate(borrow.ngay_tra_thuc_te) }}
            </span>
            <span v-else class="text-gray-300">---</span>
          </td>

          <!-- Chi phí -->
          <td>
            <!-- Nếu có phí đền bù (Sự cố) -->
            <div v-if="borrow.phi_den_bu > 0">
              <span class="text-purple-700 font-bold">{{
                formatCurrency(borrow.phi_den_bu)
              }}</span>
              <div class="text-[10px] text-gray-400">Đền bù</div>
            </div>
            <!-- Nếu không thì hiển thị tiền phạt trễ hạn -->
            <div v-else>
              <span
                :class="{
                  'text-red-600 font-bold': calculateFine(borrow) > 0,
                  'text-gray-400': calculateFine(borrow) === 0,
                }"
              >
                {{ formatCurrency(calculateFine(borrow)) }}
              </span>
              <div
                v-if="calculateFine(borrow) > 0"
                class="text-[10px] text-gray-400"
              >
                Phạt trễ
              </div>
            </div>
          </td>

          <!-- Trạng thái -->
          <td class="text-center">
            <v-chip
              class="font-weight-bold"
              :color="getStatusColor(borrow.trang_thai)"
              variant="flat"
              size="small"
              label
            >
              {{ getStatusText(borrow.trang_thai) }}
            </v-chip>
          </td>

          <!-- Sự cố & Phương án -->
          <td>
            <div v-if="borrow.loai_su_co" class="text-xs">
              <div class="flex items-center text-red-600 font-bold">
                <v-icon size="14" start>mdi-alert-circle</v-icon>
                {{ getIssueText(borrow.loai_su_co) }}
              </div>
              <div v-if="borrow.phuong_an_den_bu" class="mt-1 text-blue-700">
                PA:
                <strong>{{ getMethodText(borrow.phuong_an_den_bu) }}</strong>
              </div>
              <div v-else class="text-gray-400 italic mt-1">Chưa chọn PA</div>
            </div>
            <span v-else class="text-gray-300 text-xs">---</span>
          </td>

          <!-- Hành động -->
          <td class="text-right">
            <div class="flex justify-end items-center gap-1">
              <!-- Nút Duyệt -->
              <v-btn
                v-if="borrow.trang_thai === 'pending'"
                color="warning"
                size="small"
                variant="flat"
                class="px-2"
                @click="handleApprove(borrow._id)"
                v-tooltip:top="'Duyệt phiếu mượn'"
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>

              <!-- Nút Trả sách -->
              <v-btn
                v-if="borrow.trang_thai === 'borrowing'"
                color="success"
                size="small"
                variant="flat"
                class="px-2"
                @click="handleReturn(borrow._id)"
                v-tooltip:top="'Xác nhận trả sách'"
              >
                <v-icon>mdi-book-arrow-left</v-icon>
              </v-btn>

              <!-- Nút Giải quyết sự cố -->
              <v-btn
                v-if="borrow.trang_thai === 'gap_su_co'"
                color="purple"
                size="small"
                variant="flat"
                class="px-2"
                @click="openResolveDialog(borrow)"
                v-tooltip:top="'Giải quyết sự cố'"
              >
                <v-icon>mdi-gavel</v-icon>
              </v-btn>

              <!-- Edit -->
              <v-btn
                icon
                variant="text"
                color="blue"
                size="small"
                @click="$router.push(`/admin/borrows/edit/${borrow._id}`)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <!-- Delete (Chỉ hiện khi an toàn để xóa) -->
              <v-btn
                v-if="
                  ['returned', 'da_xu_ly', 'pending'].includes(
                    borrow.trang_thai
                  )
                "
                icon
                variant="text"
                color="grey"
                size="small"
                @click="deleteBorrow(borrow._id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </td>
        </tr>
        <tr v-if="paginatedBorrows.length === 0">
          <td colspan="12" class="text-center py-8 text-gray-500">
            <v-icon size="40" color="grey-lighten-2" class="mb-2"
              >mdi-inbox-outline</v-icon
            >
            <p>Không tìm thấy dữ liệu phù hợp.</p>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <v-row class="mt-2">
      <v-col cols="12" class="flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          active-color="black"
          variant="flat"
          rounded="circle"
        />
      </v-col>
    </v-row>

    <!-- Dialog Giải quyết sự cố -->
    <v-dialog v-model="resolveDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title
          class="bg-purple-700 text-white font-bold flex items-center"
        >
          <v-icon start>mdi-gavel</v-icon> Giải quyết sự cố
        </v-card-title>
        <v-card-text class="pt-6">
          <div
            class="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-100"
          >
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-gray-500">Độc giả:</div>
              <div class="font-bold">{{ selectedBorrow?.docgia?.ho_ten }}</div>

              <div class="text-gray-500">Sách:</div>
              <div class="font-bold">{{ selectedBorrow?.sach?.ten_sach }}</div>

              <div class="text-gray-500">Sự cố:</div>
              <div class="font-bold text-red-600">
                {{ getIssueText(selectedBorrow?.loai_su_co) }}
              </div>

              <div class="text-gray-500">Phương án:</div>
              <div class="font-bold text-blue-700">
                {{
                  getMethodText(selectedBorrow?.phuong_an_den_bu) || "Chưa chọn"
                }}
              </div>
            </div>

            <div
              v-if="selectedBorrow?.phi_den_bu > 0"
              class="mt-3 pt-3 border-t border-purple-200 flex justify-between items-center"
            >
              <span class="font-bold text-gray-700">Tổng thu:</span>
              <span class="text-xl font-bold text-purple-700">{{
                formatCurrency(selectedBorrow?.phi_den_bu)
              }}</span>
            </div>
          </div>

          <v-textarea
            v-model="resolveNote"
            label="Ghi chú xử lý (VD: Đã nhận tiền/sách, Mã hóa đơn...)"
            rows="3"
            variant="outlined"
            color="purple"
          ></v-textarea>

          <div class="text-xs text-gray-500 mt-2">
            <v-icon size="14" color="info" class="mr-1">mdi-information</v-icon>
            Hệ thống sẽ cập nhật kho sách và mở khóa tài khoản người dùng nếu đủ
            điều kiện.
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="resolveDialog = false">Hủy bỏ</v-btn>
          <v-btn
            color="purple"
            variant="flat"
            class="text-white px-4"
            @click="confirmResolve"
          >
            <v-icon start>mdi-check-circle</v-icon> Xác nhận hoàn tất
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/services/api.service";

const borrows = ref([]);
const search = ref("");
const message = ref("");
const messageType = ref("");

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Dialog Resolver
const resolveDialog = ref(false);
const selectedBorrow = ref(null);
const resolveNote = ref("");

const fetchBorrows = async () => {
  try {
    const res = await api.get("/api/borrows");
    borrows.value = res.data.reverse();
  } catch (err) {
    showMessage("Lỗi khi tải dữ liệu", "error");
  }
};

onMounted(fetchBorrows);

const filteredBorrows = computed(() => {
  const q = search.value.toLowerCase();
  return borrows.value.filter(
    (b) =>
      b.docgia?.ho_ten?.toLowerCase().includes(q) ||
      b.sach?.ten_sach?.toLowerCase().includes(q) ||
      b.trang_thai?.toLowerCase().includes(q)
  );
});

const paginatedBorrows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredBorrows.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() =>
  Math.ceil(filteredBorrows.value.length / itemsPerPage.value)
);

watch(search, () => {
  currentPage.value = 1;
});

// --- HELPER FUNCTIONS ---

function formatCurrency(value) {
  if (!value && value !== 0) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(dateStr) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function calculateDueDate(borrow) {
  if (borrow.han_tra) return borrow.han_tra;
  if (borrow.ngay_muon) {
    const d = new Date(borrow.ngay_muon);
    d.setDate(d.getDate() + 14);
    return d.toISOString();
  }
  return null;
}

function calculateFine(borrow) {
  if (borrow.trang_thai === "pending" || borrow.trang_thai === "gap_su_co")
    return 0;

  const dueDateStr = calculateDueDate(borrow);
  if (!dueDateStr) return 0;

  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);

  let returnDate;
  if (["returned", "da_xu_ly"].includes(borrow.trang_thai)) {
    const realDate = borrow.ngay_tra_thuc_te || borrow.ngay_tra;
    if (!realDate) return 0;
    returnDate = new Date(realDate);
  } else {
    returnDate = new Date();
  }
  returnDate.setHours(0, 0, 0, 0);

  if (returnDate <= dueDate) return 0;

  const diffTime = returnDate - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * 5000;
}

function getStatusColor(status) {
  const map = {
    pending: "orange-darken-2",
    borrowing: "blue",
    returned: "green",
    gap_su_co: "purple",
    da_xu_ly: "grey-darken-1",
  };
  return map[status] || "grey";
}

function getStatusText(status) {
  const map = {
    pending: "Chờ duyệt",
    borrowing: "Đang mượn",
    returned: "Đã trả",
    gap_su_co: "Gặp sự cố",
    da_xu_ly: "Đã xử lý",
  };
  return map[status] || status;
}

function getIssueText(code) {
  if (code === "mat_sach") return "Mất sách";
  if (code === "hu_hong") return "Hư hỏng";
  return code;
}

function getMethodText(code) {
  if (code === "tu_mua") return "Tự mua trả";
  if (code === "den_tien") return "Đền tiền";
  return code;
}

function showMessage(msg, type = "success") {
  message.value = msg;
  messageType.value = type;
  // Tự tắt sau 3s
  setTimeout(() => (message.value = ""), 3000);
}

// --- ACTIONS ---

async function handleApprove(id) {
  try {
    await api.put(`/api/borrows/${id}/approve`, { trang_thai: "borrowing" });
    showMessage("Đã duyệt phiếu mượn");
    fetchBorrows();
  } catch (err) {
    showMessage("Lỗi duyệt: " + err.message, "error");
  }
}

async function handleReturn(id) {
  if (!confirm("Xác nhận trả sách bình thường?")) return;
  try {
    const today = new Date().toISOString();
    await api.put(`/api/borrows/${id}/return`, {
      returnDate: today,
      ngay_tra_thuc_te: today,
    });
    showMessage("Trả sách thành công");
    fetchBorrows();
  } catch (err) {
    showMessage("Lỗi trả sách: " + err.message, "error");
  }
}

async function deleteBorrow(id) {
  if (!confirm("Bạn có chắc muốn xoá bản ghi này?")) return;
  try {
    await api.delete(`/api/borrows/${id}`);
    showMessage("Đã xóa bản ghi");
    fetchBorrows();
  } catch (err) {
    showMessage("Lỗi xóa: " + err.message, "error");
  }
}

// --- RESOLVE ACTIONS ---

function openResolveDialog(borrow) {
  selectedBorrow.value = borrow;
  resolveNote.value = "";
  resolveDialog.value = true;
}

async function confirmResolve() {
  if (!selectedBorrow.value) return;
  try {
    await api.put(`/api/borrows/${selectedBorrow.value._id}/resolve`, {
      ghi_chu: resolveNote.value,
    });
    showMessage("Đã giải quyết sự cố thành công!");
    resolveDialog.value = false;
    fetchBorrows();
  } catch (err) {
    showMessage(
      "Lỗi giải quyết: " + (err.response?.data?.message || err.message),
      "error"
    );
  }
}
</script>

<style scoped>
.v-table th {
  font-weight: 600 !important;
  color: #374151 !important;
  white-space: nowrap;
}
.v-table td {
  padding: 12px 16px !important;
  vertical-align: middle;
}
</style>
