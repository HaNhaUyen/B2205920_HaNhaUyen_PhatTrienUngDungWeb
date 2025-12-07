<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <v-card class="rounded-2xl shadow-md bg-white p-6">
      <!-- Thông tin sách (GIỮ NGUYÊN) -->
      <div class="grid md:grid-cols-2 gap-8 mb-10 px-6" v-if="book">
        <v-img
          :src="book.anh_bia"
          class="rounded-xl shadow h-96 object-contain"
        ></v-img>
        <div class="flex flex-col justify-between">
          <div>
            <h1 class="text-3xl font-semibold text-gray-900 mb-2">
              {{ book.ten_sach }}
            </h1>

            <div class="flex flex-col gap-2 mb-4">
              <p class="text-gray-600 text-sm">
                Tác giả:
                <span class="font-medium text-lg text-black">{{
                  book.tacgia.ho_ten
                }}</span>
              </p>
              <p class="text-green-700 font-bold text-xl">
                {{ formatCurrency(book.don_gia) }}
              </p>
            </div>

            <p class="text-gray-600 mb-6 text-justify leading-relaxed">
              {{ book.mo_ta }}
            </p>

            <div
              class="flex items-center flex-wrap gap-4 text-gray-700 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100"
            >
              <div
                class="flex items-center gap-2"
                :class="book.so_luong > 0 ? 'text-blue-600' : 'text-red-600'"
              >
                <v-icon size="20">mdi-package-variant-closed</v-icon>
                <span class="font-bold">
                  {{
                    book.so_luong > 0
                      ? `Còn lại: ${book.so_luong} cuốn`
                      : "Hết hàng"
                  }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <v-icon size="20">mdi-calendar</v-icon>
                <span>Năm XB: {{ book.nam_xuat_ban }}</span>
              </div>

              <div class="flex items-center gap-2">
                <v-icon size="20">mdi-tag</v-icon>
                <span>Thể loại: {{ book.theloai.ten_the_loai }}</span>
              </div>

              <div class="flex items-center gap-2" v-if="book.nhaxuatban">
                <v-icon size="20">mdi-domain</v-icon>
                <span>NXB: {{ book.nhaxuatban.ten_nxb }}</span>
              </div>
            </div>
          </div>

          <v-btn
            color="black"
            class="mt-6 py-8 flex align-content-center text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all"
            @click="borrowBook"
            :disabled="book.so_luong <= 0"
          >
            <v-icon start class="mr-1">mdi-book-check</v-icon>
            {{ book.so_luong > 0 ? "Đăng ký mượn sách" : "Tạm hết sách" }}
          </v-btn>
        </div>
      </div>

      <!-- Đánh giá (GIỮ NGUYÊN) -->
      <div class="mt-10 px-6 py-6 border-t">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          Đánh giá của bạn đọc
        </h2>

        <div
          v-for="(review, index) in reviews"
          :key="index"
          class="mb-6 bg-gray-50 p-4 rounded-lg"
          v-if="reviews.length"
        >
          <div class="flex items-center gap-3 mb-1">
            <v-icon color="grey darken-2">mdi-account-circle</v-icon>
            <span class="font-medium text-lg">{{ review.name }}</span>
            <v-rating
              :size="24"
              :model-value="review.rating"
              active-color="amber"
              readonly
              density="compact"
            />
          </div>
          <p class="text-gray-500 text-xs ml-9 mb-2">
            {{
              new Date(review.createAt).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })
            }}
          </p>
          <p class="text-gray-800 ml-9">{{ review.comment }}</p>
        </div>
        <div class="text-center py-4 text-gray-500" v-else>
          <span>Chưa có đánh giá nào cho cuốn sách này.</span>
        </div>

        <div class="mt-8">
          <h3 class="text-lg font-semibold mb-2">Gửi đánh giá của bạn</h3>
          <v-textarea
            v-model="newReview.comment"
            label="Nhập nội dung nhận xét..."
            outlined
            auto-grow
            rows="3"
            class="mb-2"
          ></v-textarea>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">Đánh giá sao:</span>
            <v-rating
              v-model="newReview.rating"
              :size="32"
              hover
              active-color="amber"
              color="grey-lighten-1"
            />
          </div>
          <div class="mt-4">
            <v-btn color="black" class="text-white" @click="submitReview"
              >Gửi đánh giá</v-btn
            >
          </div>
        </div>
      </div>
    </v-card>

    <!-- Dialog Mượn sách (ĐÃ SỬA NÚT MƯỢN) -->
    <v-dialog v-model="borrowDialog" max-width="500px">
      <v-card class="p-4 rounded-lg">
        <v-card-title class="text-xl font-bold text-center"
          >Thông tin mượn sách</v-card-title
        >
        <v-divider class="my-2"></v-divider>

        <p
          v-if="borrowErrorMessage"
          class="text-red-600 my-2 text-center font-bold bg-red-50 p-2 rounded"
        >
          {{ borrowErrorMessage }}
        </p>

        <v-card-text>
          <div class="mb-4">
            <p class="font-semibold">{{ book?.ten_sach }}</p>
            <p class="text-sm text-green-700 font-bold">
              Giá cọc/đền bù: {{ formatCurrency(book?.don_gia) }}
            </p>
          </div>

          <v-text-field
            v-model.number="borrowForm.quantity"
            label="Số lượng muốn mượn"
            type="number"
            min="1"
            max="5"
            variant="outlined"
            density="comfortable"
            @input="checkQuantity"
          />

          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="borrowForm.borrowDate"
                label="Ngày bắt đầu mượn"
                readonly
                v-bind="attrs"
                v-on="on"
                variant="outlined"
                density="comfortable"
                append-inner-icon="mdi-calendar"
              />
            </template>

            <v-date-picker
              :model-value="borrowForm.borrowDate"
              @update:model-value="onSelectDate"
              :min="minDate"
              color="primary"
            />
          </v-menu>

          <div class="bg-blue-50 p-3 rounded mt-2">
            <p class="text-sm text-blue-800">
              📅 Ngày trả dự kiến (2 tuần): <strong>{{ dueDate }}</strong>
            </p>
          </div>
        </v-card-text>

        <!-- PHẦN ĐÃ SỬA: Đảm bảo nút hiện rõ -->
        <v-card-actions class="px-6 pb-6 pt-0 flex justify-end gap-3">
          <v-btn variant="text" @click="borrowDialog = false">Huỷ</v-btn>
          <!-- Sử dụng variant="flat" để chắc chắn có nền màu đen -->
          <v-btn
            color="black"
            variant="flat"
            class="text-white font-bold bg-black"
            @click="confirmBorrow"
          >
            Mượn sách
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// Giữ nguyên phần Script như cũ
import { useRouter, useRoute } from "vue-router";
import api from "@/services/api.service";

export default {
  name: "BookDetail",
  data() {
    return {
      book: null,
      reviews: [],
      newReview: {
        name: "",
        comment: "",
        rating: 0,
      },
      borrowDialog: false,
      dateMenu: false,
      borrowForm: {
        quantity: 1,
        borrowDate: new Date().toISOString().substr(0, 10),
      },
      borrowErrorMessage: "",
    };
  },
  computed: {
    minDate() {
      return new Date().toISOString().substr(0, 10);
    },
    dueDate() {
      const borrow = new Date(this.borrowForm.borrowDate);
      const due = new Date(borrow.setDate(borrow.getDate() + 14));
      return due.toISOString().substr(0, 10);
    },
  },
  async created() {
    const route = useRoute();
    const bookId = route.params.id;

    try {
      const response = await api.get(`/api/books/${bookId}`);
      this.book = response.data;

      // Lấy danh sách comment
      const commentsRes = await api.get(`/api/comments/books/${bookId}`);
      this.reviews = commentsRes.data
        .map((c) => ({
          name: c.user?.ho_ten || "Ẩn danh",
          comment: c.noi_dung,
          rating: c.ti_le || 3,
          createAt: c.ngay_tao,
        }))
        .reverse();
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sách:", error);
    }
  },
  methods: {
    formatCurrency(value) {
      if (!value && value !== 0) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },

    checkQuantity() {
      if (this.borrowForm.quantity > 5) {
        this.borrowForm.quantity = 5;
      }
      if (
        this.borrowForm.quantity < 1 &&
        this.borrowForm.quantity !== "" &&
        this.borrowForm.quantity !== null
      ) {
        this.borrowForm.quantity = 1;
      }
    },
    onSelectDate(date) {
      this.borrowForm.borrowDate = date;
      this.dateMenu = false;
    },
    async submitReview() {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!this.newReview.comment || this.newReview.rating <= 0) {
        alert("❗ Vui lòng nhập nhận xét và đánh giá.");
        return;
      }

      if (!userId) {
        alert("❗ Vui lòng đăng nhập để gửi đánh giá.");
        return;
      }

      try {
        const payload = {
          ma_doc_gia: userId,
          ma_sach: this.book._id,
          noi_dung: this.newReview.comment,
          ti_le: this.newReview.rating,
        };

        const res = await api.post("/api/comments", payload);

        this.reviews.unshift({
          name: user.name,
          comment: payload.noi_dung,
          rating: payload.ti_le,
          createAt: new Date().toISOString(),
        });

        this.newReview = { comment: "", rating: 0 };
        alert("✅ Cảm ơn bạn đã gửi đánh giá!");
      } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error);
        alert("❌ Gửi đánh giá thất bại. Vui lòng thử lại.");
      }
    },
    borrowBook() {
      this.borrowDialog = true;
      this.borrowForm.quantity = 1;
      this.borrowErrorMessage = "";
    },

    async confirmBorrow() {
      const borrowDate = new Date(this.borrowForm.borrowDate);
      const today = new Date();
      this.borrowErrorMessage = "";

      if (borrowDate < new Date(today.toDateString())) {
        this.borrowErrorMessage =
          "❌ Ngày mượn không được là ngày trong quá khứ!";
        return;
      }

      if (this.borrowForm.quantity <= 0) {
        this.borrowErrorMessage = "❌ Số lượng phải lớn hơn 0!";
        return;
      }
      if (this.borrowForm.quantity > 5) {
        this.borrowErrorMessage =
          "❌ Bạn chỉ được mượn tối đa 5 cuốn cho đầu sách này!";
        return;
      }
      if (this.book.so_luong < this.borrowForm.quantity) {
        this.borrowErrorMessage = `❌ Số lượng trong kho chỉ còn ${this.book.so_luong} cuốn!`;
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      if (!userId) {
        this.borrowErrorMessage = "❌ Vui lòng đăng nhập để mượn sách!";
        return;
      }

      try {
        const historyRes = await api.get(`/api/borrows/user/${userId}`);
        const borrowHistory = historyRes.data;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const hasOverdue = borrowHistory.some((item) => {
          if (item.trang_thai === "borrowing" && item.han_tra) {
            const dueDate = new Date(item.han_tra);
            dueDate.setHours(0, 0, 0, 0);
            return now > dueDate;
          }
          return false;
        });

        if (hasOverdue) {
          this.borrowErrorMessage =
            "🚫 Bạn có sách quá hạn chưa trả. Vui lòng trả sách trước khi mượn tiếp!";
          return;
        }

        await api.post("/api/borrows", {
          ma_doc_gia: userId,
          ma_sach: this.book._id,
          so_luong: this.borrowForm.quantity,
          ngay_muon: this.borrowForm.borrowDate,
          han_tra: this.dueDate,
        });

        alert("✅ Đăng ký mượn sách thành công!");
        this.borrowDialog = false;
      } catch (err) {
        console.error(err);
        this.borrowErrorMessage =
          err?.response?.data?.message || "Có lỗi xảy ra khi xử lý!";
      }
    },
  },
};
</script>
