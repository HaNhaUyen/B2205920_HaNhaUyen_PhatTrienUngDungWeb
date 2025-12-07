<template>
  <v-container class="py-8">
    <h2 class="text-h4 font-weight-bold mb-6 text-primary d-flex align-center">
      <v-icon class="mr-3" size="36">mdi-book-account-outline</v-icon>
      Lịch sử mượn sách
    </h2>

    <!-- Các cảnh báo trạng thái tài khoản -->
    <v-fade-transition>
      <!-- 1. Cảnh báo SỰ CỐ -->
      <v-alert
        v-if="hasIssues"
        type="warning"
        variant="tonal"
        border="start"
        elevation="2"
        class="mb-4"
        icon="mdi-alert"
      >
        <div class="text-h6 font-weight-bold text-deep-orange-darken-4">
          Tài khoản tạm khóa do sự cố!
        </div>
        <div>
          Bạn đang có <strong>{{ issuesCount }}</strong> quyển sách được báo cáo
          mất/hư hỏng. Vui lòng chọn phương án đền bù để mở khóa tài khoản.
        </div>
      </v-alert>

      <!-- 2. Cảnh báo QUÁ HẠN -->
      <v-alert
        v-else-if="hasOverdueBooks"
        type="error"
        variant="tonal"
        border="start"
        elevation="2"
        class="mb-6"
        icon="mdi-alert-octagon"
      >
        <div class="text-h6 font-weight-bold">Tài khoản đang bị khóa mượn!</div>
        <div>
          Bạn đang có <strong>{{ overdueBooksCount }}</strong> quyển sách quá
          hạn. Vui lòng trả sách để tiếp tục được mượn mới.
        </div>
      </v-alert>

      <!-- 3. Trạng thái TỐT -->
      <v-alert
        v-else
        type="success"
        variant="tonal"
        border="start"
        elevation="2"
        class="mb-6"
        icon="mdi-check-circle"
      >
        <div class="text-subtitle-1 font-weight-bold">
          Trạng thái tài khoản: Tốt
        </div>
        <div class="text-caption">
          Bạn có thể mượn thêm sách (Tối đa 5 quyển cho mỗi đầu sách).
        </div>
      </v-alert>
    </v-fade-transition>

    <v-card elevation="2" class="rounded-lg">
      <v-data-table
        :headers="headers"
        :items="paginatedBooks"
        :loading="loading"
        no-data-text="Bạn chưa mượn quyển sách nào"
        class="pa-2"
      >
        <template v-slot:bottom></template>

        <!-- Tên sách -->
        <template v-slot:item.book_name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar rounded="0" size="48" class="mr-3 bg-grey-lighten-3">
              <v-img :src="item.book?.anh_bia" cover></v-img>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-1">
                {{ item.book?.ten_sach }}
              </div>
              <!-- Hiển thị sự cố nếu có -->
              <div
                v-if="item.loai_su_co"
                class="text-caption text-red font-weight-bold"
              >
                Sự cố: {{ getIssueText(item.loai_su_co) }}
              </div>
            </div>
          </div>
        </template>

        <!-- Đơn giá -->
        <template v-slot:item.don_gia="{ item }">
          <span class="font-weight-bold text-green-700">
            {{ formatCurrency(item.book?.don_gia) }}
          </span>
        </template>

        <!-- Ngày mượn -->
        <template v-slot:item.ngay_muon="{ item }">
          {{ formatDate(item.ngay_muon) }}
        </template>

        <!-- Hạn trả / Hạn xử lý -->
        <template v-slot:item.han_tra="{ item }">
          <!-- TH1: Đang gặp sự cố -> Hiện hạn xử lý -->
          <div
            v-if="item.trang_thai === 'gap_su_co'"
            class="text-deep-orange font-weight-bold"
          >
            {{ formatDate(item.han_xu_ly) }}
            <div class="text-[10px]">(Hạn xử lý)</div>
          </div>
          <!-- TH2: Bình thường -> Hiện hạn trả -->
          <span
            v-else
            :class="isOverdue(item) ? 'text-red font-weight-bold' : ''"
          >
            {{ formatDate(calculateDueDate(item)) }}
            <v-chip
              v-if="isOverdue(item)"
              color="red"
              size="x-small"
              class="ml-1"
              variant="flat"
            >
              QUÁ HẠN
            </v-chip>
          </span>
        </template>

        <!-- Ngày trả thực -->
        <template v-slot:item.ngay_tra="{ item }">
          <span
            v-if="item.ngay_tra_thuc_te"
            class="text-success font-weight-bold"
          >
            {{ formatDate(item.ngay_tra_thuc_te) }}
          </span>
          <span v-else class="text-grey">---</span>
        </template>

        <!-- Tiền phạt / Phí đền bù -->
        <template v-slot:item.tien_phat="{ item }">
          <!-- TH1: Nếu có phí đền bù (Sự cố) -->
          <div v-if="item.phi_den_bu > 0">
            <span class="text-purple-700 font-bold">{{
              formatCurrency(item.phi_den_bu)
            }}</span>
            <div class="text-caption text-grey">(Đền bù)</div>
          </div>
          <!-- TH2: Nếu là tiền phạt trễ hạn -->
          <div v-else>
            <span
              :class="{
                'text-red-600 font-bold': calculateFine(item) > 0,
                'text-grey': calculateFine(item) === 0,
              }"
            >
              {{ formatCurrency(calculateFine(item)) }}
            </span>
          </div>
        </template>

        <!-- Trạng thái -->
        <template v-slot:item.trang_thai="{ item }">
          <v-chip
            :color="getStatusColor(item.trang_thai)"
            size="small"
            class="font-weight-bold text-uppercase"
            variant="flat"
          >
            {{ getStatusText(item.trang_thai) }}
          </v-chip>
          <div
            v-if="item.phuong_an_den_bu"
            class="mt-1 text-caption font-weight-bold text-blue"
          >
            PA: {{ getMethodText(item.phuong_an_den_bu) }}
          </div>
        </template>

        <!-- Hành động -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex flex-column gap-2 align-end">
            <!-- Hủy (Pending) -->
            <v-btn
              v-if="item.trang_thai === 'pending'"
              color="red"
              variant="flat"
              size="small"
              class="font-weight-bold text-white"
              @click="cancelRequest(item._id)"
              :loading="actionLoading === item._id"
            >
              <v-icon size="18" class="mr-1">mdi-close</v-icon> Hủy
            </v-btn>

            <!-- Trả sách & Báo sự cố (Borrowing) -->
            <div
              v-if="item.trang_thai === 'borrowing'"
              class="d-flex flex-column gap-1"
            >
              <v-btn
                color="success"
                variant="flat"
                size="small"
                class="font-weight-bold text-white"
                @click="returnBook(item._id)"
                :loading="actionLoading === item._id"
              >
                <v-icon size="18" class="mr-1">mdi-check</v-icon> Trả sách
              </v-btn>

              <v-btn
                color="warning"
                variant="text"
                size="x-small"
                class="font-weight-bold"
                @click="openReportDialog(item)"
              >
                <v-icon size="14" class="mr-1">mdi-alert</v-icon> Báo sự cố
              </v-btn>
            </div>

            <!-- Chọn đền bù (Gap su co) -->
            <div v-if="item.trang_thai === 'gap_su_co'">
              <v-btn
                v-if="!item.phuong_an_den_bu"
                color="deep-purple"
                variant="flat"
                size="small"
                class="text-white font-bold"
                @click="openCompensationDialog(item)"
              >
                Chọn đền bù
              </v-btn>
              <span v-else class="text-caption text-grey"
                >Chờ Admin xử lý...</span
              >
            </div>

            <!-- Hoàn tất -->
            <span
              v-if="['returned', 'da_xu_ly'].includes(item.trang_thai)"
              class="text-success text-caption font-weight-bold d-flex align-center"
            >
              <v-icon size="small" color="success" class="mr-1"
                >mdi-check-all</v-icon
              >
              Hoàn tất
            </span>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-row class="mt-4" v-if="totalPages > 0">
      <v-col cols="12" class="flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          rounded
        />
      </v-col>
    </v-row>

    <!-- Dialogs (Giữ nguyên) -->
    <v-dialog v-model="reportDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-orange-darken-3 text-white"
          >Báo cáo sự cố</v-card-title
        >
        <v-card-text class="pt-4">
          <p class="mb-2">
            Sách: <strong>{{ selectedItem?.book?.ten_sach }}</strong>
          </p>
          <p class="mb-4 text-caption text-grey">
            Lưu ý: Sau khi báo cáo, tài khoản sẽ bị tạm khóa cho đến khi sự cố
            được giải quyết.
          </p>
          <v-radio-group v-model="reportReason" color="orange-darken-3">
            <v-radio label="Mất sách" value="mat_sach"></v-radio>
            <v-radio
              label="Sách bị hư hỏng / Rách nát"
              value="hu_hong"
            ></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="reportDialog = false">Hủy</v-btn>
          <v-btn color="orange-darken-3" variant="flat" @click="submitReport"
            >Gửi báo cáo</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="compensationDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-deep-purple text-white"
          >Chọn phương án đền bù</v-card-title
        >
        <v-card-text class="pt-4">
          <p class="mb-2">
            Bạn muốn giải quyết sự cố cho cuốn:
            <strong>{{ selectedItem?.book?.ten_sach }}</strong> như thế nào?
          </p>
          <v-radio-group v-model="compensationMethod" color="deep-purple">
            <v-radio value="tu_mua">
              <template v-slot:label>
                <div>
                  <strong>Tự mua bản thay thế</strong>
                  <div class="text-caption">
                    Mua cuốn sách cùng loại (hoặc mới hơn) để trả lại thư viện.
                  </div>
                </div>
              </template>
            </v-radio>
            <v-radio value="den_tien">
              <template v-slot:label>
                <div>
                  <strong>Đền bù bằng tiền</strong>
                  <div class="text-caption">
                    Phí = Giá sách ({{
                      formatCurrency(selectedItem?.book?.don_gia)
                    }}) + Phí xử lý (20.000 đ)
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
          <v-alert type="info" variant="tonal" class="text-caption mt-2">
            Nếu không phản hồi trong vòng 14 ngày, hệ thống sẽ tự động chọn
            phương án "Đền bù bằng tiền".
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="compensationDialog = false">Hủy</v-btn>
          <v-btn color="deep-purple" variant="flat" @click="submitCompensation"
            >Xác nhận</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import api from "@/services/api.service";

export default {
  data() {
    return {
      loading: false,
      actionLoading: null,
      borrowedBooks: [],
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",

      reportDialog: false,
      compensationDialog: false,
      selectedItem: null,
      reportReason: "mat_sach",
      compensationMethod: "tu_mua",

      headers: [
        { title: "Thông tin sách", key: "book_name", sortable: false },
        { title: "Đơn giá", key: "don_gia", align: "end" },
        { title: "Ngày mượn", key: "ngay_muon" },
        { title: "Ngày trả dự kiến", key: "han_tra" },
        { title: "Ngày trả thực", key: "ngay_tra" },
        { title: "Tiền phạt / Đền bù", key: "tien_phat" },
        { title: "Trạng thái", key: "trang_thai", align: "center" },
        { title: "Hành động", key: "actions", sortable: false, align: "end" },
      ],
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.borrowedBooks.length / this.itemsPerPage);
    },
    paginatedBooks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.borrowedBooks.slice(start, end);
    },
    overdueBooksList() {
      return this.borrowedBooks.filter(
        (book) => book.trang_thai === "borrowing" && this.isOverdue(book)
      );
    },
    overdueBooksCount() {
      return this.overdueBooksList.length;
    },
    hasOverdueBooks() {
      return this.overdueBooksCount > 0;
    },
    issuesList() {
      return this.borrowedBooks.filter((b) => b.trang_thai === "gap_su_co");
    },
    issuesCount() {
      return this.issuesList.length;
    },
    hasIssues() {
      return this.issuesCount > 0;
    },
  },
  created() {
    this.fetchBorrowedBooks();
  },
  methods: {
    async fetchBorrowedBooks() {
      this.loading = true;
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
          this.$router.push("/login");
          return;
        }
        const response = await api.get(`/api/borrows/user/${user.id}`);
        this.borrowedBooks = response.data.reverse();
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      } finally {
        this.loading = false;
      }
    },

    openReportDialog(item) {
      this.selectedItem = item;
      this.reportReason = "mat_sach";
      this.reportDialog = true;
    },
    openCompensationDialog(item) {
      this.selectedItem = item;
      this.compensationMethod = "tu_mua";
      this.compensationDialog = true;
    },

    async submitReport() {
      if (!this.selectedItem) return;
      try {
        await api.post(`/api/borrows/${this.selectedItem._id}/report`, {
          ly_do: this.reportReason,
        });
        this.showSnackbar(
          "Đã báo cáo sự cố. Tài khoản tạm thời bị khóa.",
          "warning"
        );
        this.reportDialog = false;
        this.fetchBorrowedBooks();
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.message || "Lỗi báo cáo",
          "error"
        );
      }
    },

    async submitCompensation() {
      if (!this.selectedItem) return;
      try {
        await api.post(`/api/borrows/${this.selectedItem._id}/compensation`, {
          phuong_an: this.compensationMethod,
        });
        this.showSnackbar(
          "Đã cập nhật phương án đền bù. Vui lòng hoàn tất nghĩa vụ để mở khóa.",
          "success"
        );
        this.compensationDialog = false;
        this.fetchBorrowedBooks();
      } catch (err) {
        this.showSnackbar(
          err.response?.data?.message || "Lỗi cập nhật",
          "error"
        );
      }
    },

    async cancelRequest(borrowId) {
      if (!confirm("Bạn có chắc muốn hủy yêu cầu mượn sách này?")) return;
      this.actionLoading = borrowId;
      try {
        await api.delete(`/api/borrows/${borrowId}`);
        this.borrowedBooks = this.borrowedBooks.filter(
          (item) => item._id !== borrowId
        );
        this.showSnackbar("Đã hủy yêu cầu mượn sách thành công", "success");
      } catch (error) {
        this.showSnackbar(
          "Lỗi: " + (error.response?.data?.message || error.message),
          "error"
        );
      } finally {
        this.actionLoading = null;
      }
    },

    async returnBook(borrowId) {
      if (!confirm("Xác nhận trả sách này?")) return;
      this.actionLoading = borrowId;
      try {
        const today = new Date().toISOString();
        const res = await api.put(`/api/borrows/${borrowId}/return`, {
          returnDate: today,
          ngay_tra_thuc_te: today,
        });
        const index = this.borrowedBooks.findIndex(
          (item) => item._id === borrowId
        );
        if (index !== -1) {
          this.borrowedBooks[index] = {
            ...this.borrowedBooks[index],
            ...res.data,
          };
          this.borrowedBooks[index].trang_thai = "returned";
        }
        this.showSnackbar("Đã trả sách thành công!", "success");
      } catch (error) {
        this.showSnackbar(
          "Lỗi: " + (error.response?.data?.message || error.message),
          "error"
        );
      } finally {
        this.actionLoading = null;
      }
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },
    formatCurrency(value) {
      if (!value && value !== 0) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },
    calculateDueDate(borrow) {
      if (borrow.han_tra) return borrow.han_tra;
      if (borrow.ngay_muon) {
        const borrowDate = new Date(borrow.ngay_muon);
        const dueDate = new Date(
          borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000
        );
        return dueDate.toISOString();
      }
      return null;
    },

    // ✅ LOGIC TÍNH TIỀN PHẠT (Cập nhật để đồng bộ với Admin)
    calculateFine(borrow) {
      // Nếu đang chờ duyệt, gặp sự cố hoặc đã xử lý xong thì không tính phạt trễ hạn
      if (["pending", "gap_su_co", "da_xu_ly"].includes(borrow.trang_thai))
        return 0;

      const dueDateStr = this.calculateDueDate(borrow);
      if (!dueDateStr) return 0;

      const dueDate = new Date(dueDateStr);
      dueDate.setHours(0, 0, 0, 0); // Reset giờ

      let returnDate;

      // Nếu đã trả: dùng ngày trả thực tế
      if (["returned"].includes(borrow.trang_thai)) {
        const realDate = borrow.ngay_tra_thuc_te || borrow.ngay_tra;
        if (!realDate) return 0;
        returnDate = new Date(realDate);
      } else {
        // Nếu ĐANG MƯỢN: dùng ngày HIỆN TẠI để tính phạt dự kiến
        returnDate = new Date();
      }
      returnDate.setHours(0, 0, 0, 0);

      // Nếu ngày trả (hoặc hôm nay) chưa quá hạn -> Phạt = 0
      if (returnDate <= dueDate) return 0;

      // Tính số ngày trễ
      const diffTime = returnDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Phạt 5000đ / ngày
      return diffDays * 5000;
    },

    isOverdue(item) {
      if (["returned", "da_xu_ly", "gap_su_co"].includes(item.trang_thai))
        return false;
      const dueDateStr = this.calculateDueDate(item);
      if (!dueDateStr) return false;
      const now = new Date();
      const dueDate = new Date(dueDateStr);
      now.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return now > dueDate;
    },

    getStatusColor(status) {
      switch (status) {
        case "pending":
          return "orange-darken-2";
        case "borrowing":
          return "blue";
        case "returned":
          return "green";
        case "rejected":
          return "grey";
        case "gap_su_co":
          return "deep-purple";
        case "da_xu_ly":
          return "grey-darken-2";
        default:
          return "grey";
      }
    },
    getStatusText(status) {
      switch (status) {
        case "pending":
          return "Chờ duyệt";
        case "borrowing":
          return "Đang mượn";
        case "returned":
          return "Đã trả";
        case "rejected":
          return "Đã hủy";
        case "gap_su_co":
          return "Gặp sự cố";
        case "da_xu_ly":
          return "Đã xử lý";
        default:
          return "Không xác định";
      }
    },
    getIssueText(code) {
      if (code === "mat_sach") return "Mất sách";
      if (code === "hu_hong") return "Hư hỏng";
      return code;
    },
    getMethodText(code) {
      if (code === "tu_mua") return "Tự mua";
      if (code === "den_tien") return "Đền tiền";
      return code;
    },
    showSnackbar(text, color) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
};
</script>
