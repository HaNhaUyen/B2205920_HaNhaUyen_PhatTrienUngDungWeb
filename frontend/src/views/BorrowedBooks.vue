<template>
  <v-container class="py-8">
    <h2 class="text-h4 font-weight-bold mb-6 text-primary d-flex align-center">
      <v-icon class="mr-3" size="36">mdi-book-account-outline</v-icon>
      Lịch sử mượn sách
    </h2>

    <v-card elevation="2" class="rounded-lg">
      <!-- 
        THAY ĐỔI 1: 
        - :items="paginatedBooks" (Thay vì borrowedBooks)
        - Thêm template v-slot:bottom để ẩn phân trang mặc định của bảng 
      -->
      <v-data-table
        :headers="headers"
        :items="paginatedBooks"
        :loading="loading"
        no-data-text="Bạn chưa mượn quyển sách nào"
        class="pa-2"
      >
        <!-- Ẩn footer mặc định để dùng v-pagination bên ngoài -->
        <template v-slot:bottom></template>

        <!-- Tùy chỉnh cột Tên sách -->
        <template v-slot:item.book_name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar rounded="0" size="48" class="mr-3 bg-grey-lighten-3">
              <v-img :src="item.book.anh_bia" cover></v-img>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-1">
                {{ item.book.ten_sach }}
              </div>
            </div>
          </div>
        </template>

        <!-- Ngày mượn -->
        <template v-slot:item.ngay_muon="{ item }">
          {{ formatDate(item.ngay_muon) }}
        </template>

        <!-- Hạn trả -->
        <template v-slot:item.han_tra="{ item }">
          <span :class="isOverdue(item) ? 'text-red font-weight-bold' : ''">
            {{ formatDate(calculateDueDate(item)) }}
          </span>
        </template>

        <!-- Ngày trả thực -->
        <template v-slot:item.ngay_tra="{ item }">
          <span
            v-if="item.ngay_tra_thuc_te || item.ngay_tra"
            class="text-success font-weight-bold"
          >
            {{ formatDate(item.ngay_tra_thuc_te || item.ngay_tra) }}
          </span>
          <span v-else>---</span>
        </template>

        <!-- Tiền phạt -->
        <template v-slot:item.tien_phat="{ item }">
          <span
            :class="{
              'text-red-600 font-bold': calculateFine(item) > 0,
              'text-grey': calculateFine(item) === 0,
            }"
          >
            {{ formatCurrency(calculateFine(item)) }}
          </span>
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
        </template>

        <!-- Hành động -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            v-if="item.trang_thai === 'pending'"
            color="red"
            variant="flat"
            size="small"
            class="font-weight-bold text-white"
            @click="cancelRequest(item._id)"
            :loading="actionLoading === item._id"
          >
            <v-icon size="18" class="mr-1">mdi-close</v-icon>
            Hủy yêu cầu
          </v-btn>

          <v-btn
            v-if="item.trang_thai === 'borrowing'"
            color="success"
            variant="flat"
            size="small"
            class="font-weight-bold text-white"
            @click="returnBook(item._id)"
            :loading="actionLoading === item._id"
          >
            <v-icon size="18" class="mr-1">mdi-check</v-icon>
            Trả sách
          </v-btn>

          <span
            v-if="item.trang_thai === 'returned'"
            class="text-success text-caption font-weight-bold d-flex align-center justify-end"
          >
            <v-icon size="small" color="success" class="mr-1"
              >mdi-check-all</v-icon
            >
            Đã hoàn tất
          </span>
        </template>
      </v-data-table>
    </v-card>

    <!-- THAY ĐỔI 2: Thêm thanh phân trang bên ngoài -->
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
      headers: [
        { title: "Thông tin sách", key: "book_name", sortable: false },
        { title: "Ngày mượn", key: "ngay_muon" },
        { title: "Hạn trả", key: "han_tra" },
        { title: "Ngày trả thực", key: "ngay_tra" },
        { title: "Số lượng", key: "so_luong", align: "center" },
        { title: "Tiền phạt", key: "tien_phat" },
        { title: "Trạng thái", key: "trang_thai", align: "center" },
        { title: "Hành động", key: "actions", sortable: false, align: "end" },
      ],
      // THAY ĐỔI 3: Thêm biến cho phân trang
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    // THAY ĐỔI 4: Tính tổng số trang
    totalPages() {
      return Math.ceil(this.borrowedBooks.length / this.itemsPerPage);
    },
    // THAY ĐỔI 5: Cắt dữ liệu theo trang hiện tại
    paginatedBooks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.borrowedBooks.slice(start, end);
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

    async cancelRequest(borrowId) {
      if (!confirm("Bạn có chắc muốn hủy yêu cầu mượn sách này?")) return;

      this.actionLoading = borrowId;
      try {
        await api.delete(`/api/borrows/${borrowId}`);
        this.borrowedBooks = this.borrowedBooks.filter(
          (item) => item._id !== borrowId
        );

        // Logic phụ: Nếu xóa hết item ở trang hiện tại thì lùi về trang trước
        if (this.paginatedBooks.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }

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
            book: this.borrowedBooks[index].book,
          };

          this.borrowedBooks[index].trang_thai = "returned";
          this.borrowedBooks[index].ngay_tra_thuc_te = today;
          this.borrowedBooks[index].ngay_tra = today;
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

    // --- CÁC HÀM HELPER GIỮ NGUYÊN ---
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },
    calculateDueDate(borrow) {
      if (borrow.han_tra) {
        return borrow.han_tra;
      }
      if (borrow.ngay_muon) {
        const borrowDate = new Date(borrow.ngay_muon);
        const dueDate = new Date(
          borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000
        );
        return dueDate.toISOString();
      }
      return null;
    },
    calculateFine(borrow) {
      if (borrow.trang_thai === "pending") return 0;
      const dueDateStr = this.calculateDueDate(borrow);
      if (!dueDateStr) return 0;
      const dueDate = new Date(dueDateStr);
      let returnDate;

      if (borrow.trang_thai === "returned") {
        const realReturnDate = borrow.ngay_tra_thuc_te || borrow.ngay_tra;
        if (!realReturnDate) return 0;
        returnDate = new Date(realReturnDate);
      } else {
        returnDate = new Date();
      }

      dueDate.setHours(0, 0, 0, 0);
      returnDate.setHours(0, 0, 0, 0);

      if (returnDate <= dueDate) return 0;

      const diffTime = returnDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays * 5000;
    },
    isOverdue(item) {
      if (item.trang_thai === "returned") return false;
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
          return "red";
        case "borrowing":
          return "blue";
        case "returned":
          return "green";
        case "rejected":
          return "grey";
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
        default:
          return "Không xác định";
      }
    },
    showSnackbar(text, color) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
};
</script>
