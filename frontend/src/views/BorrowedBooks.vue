<template>
  <v-container class="py-8">
    <h2 class="text-h4 font-weight-bold mb-6 text-primary d-flex align-center">
      <v-icon class="mr-3" size="36">mdi-book-account-outline</v-icon>
      Lịch sử mượn sách
    </h2>

    <v-card elevation="2" class="rounded-lg">
      <v-data-table
        :headers="headers"
        :items="borrowedBooks"
        :loading="loading"
        no-data-text="Bạn chưa mượn quyển sách nào"
        class="pa-2"
      >
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

        <!-- Hạn trả: Sử dụng hàm tính toán giống Admin -->
        <template v-slot:item.han_tra="{ item }">
          <span :class="isOverdue(item) ? 'text-red font-weight-bold' : ''">
            {{ formatDate(calculateDueDate(item)) }}
          </span>
        </template>

        <!-- Cột Ngày trả thực -->
        <template v-slot:item.ngay_tra="{ item }">
          <span
            v-if="item.ngay_tra_thuc_te || item.ngay_tra"
            class="text-success font-weight-bold"
          >
            {{ formatDate(item.ngay_tra_thuc_te || item.ngay_tra) }}
          </span>
          <span v-else>---</span>
        </template>

        <!-- Tiền phạt: Tính toán realtime giống Admin -->
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
    };
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

        // Gửi cả 2 trường để đảm bảo backend nhận được và đồng bộ Admin
        await api.put(`/api/borrows/${borrowId}`, {
          trang_thai: "returned",
          ngay_tra: today,
          ngay_tra_thuc_te: today,
        });

        const index = this.borrowedBooks.findIndex(
          (item) => item._id === borrowId
        );
        if (index !== -1) {
          this.borrowedBooks[index].trang_thai = "returned";
          this.borrowedBooks[index].ngay_tra = today;
          this.borrowedBooks[index].ngay_tra_thuc_te = today;
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

    // --- CÁC HÀM HELPER LOGIC GIỐNG ADMIN ---

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

    // 1. Tính hạn trả (Nếu DB null thì +14 ngày)
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

    // 2. Tính tiền phạt (Logic: 5000đ/ngày)
    calculateFine(borrow) {
      // Nếu trạng thái là Pending, chưa tính phạt
      if (borrow.trang_thai === "pending") return 0;

      // Lấy hạn trả chuẩn
      const dueDateStr = this.calculateDueDate(borrow);
      if (!dueDateStr) return 0;

      const dueDate = new Date(dueDateStr);
      let returnDate;

      // Xác định ngày để so sánh
      if (borrow.trang_thai === "returned") {
        // Nếu đã trả: dùng ngày trả thực tế
        const realReturnDate = borrow.ngay_tra_thuc_te || borrow.ngay_tra;
        if (!realReturnDate) return 0;
        returnDate = new Date(realReturnDate);
      } else {
        // Nếu đang mượn: dùng ngày hiện tại
        returnDate = new Date();
      }

      // Reset giờ phút giây để tính ngày chẵn
      dueDate.setHours(0, 0, 0, 0);
      returnDate.setHours(0, 0, 0, 0);

      // Tính chênh lệch
      if (returnDate <= dueDate) return 0;

      const diffTime = returnDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays * 5000;
    },

    // Kiểm tra quá hạn để tô đỏ
    isOverdue(item) {
      // Nếu đã trả thì không coi là quá hạn (để hiển thị màu đen bình thường)
      if (item.trang_thai === "returned") return false;

      const dueDateStr = this.calculateDueDate(item);
      if (!dueDateStr) return false;

      // So sánh ngày hiện tại với hạn trả
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
