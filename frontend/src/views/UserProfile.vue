<template>
  <v-container class="fill-height bg-grey-lighten-5 py-10" fluid>
    <div class="w-100" style="max-width: 1000px; margin: 0 auto" v-if="user">
      <!-- 1. SECTION: THÔNG TIN CÁ NHÂN (PROFILE CARD) -->
      <!-- Hiển thị cho cả Admin và Reader -->
      <v-card class="rounded-xl elevation-3 overflow-hidden mb-8">
        <!-- Cover Image Gradient -->
        <div class="profile-cover"></div>

        <div class="px-6 pb-6 position-relative">
          <!-- Avatar & Edit Button Row -->
          <div
            class="d-flex justify-space-between align-end"
            style="margin-top: -50px; margin-bottom: 20px"
          >
            <div class="d-flex align-end">
              <v-avatar size="120" class="profile-avatar elevation-4">
                <v-img
                  :src="user.anh_dai_dien || user.avatar || defaultAvatar"
                  alt="Avatar"
                  cover
                ></v-img>
              </v-avatar>
              <div class="ml-4 mb-2 d-none d-sm-block">
                <h2 class="text-h4 font-weight-bold text-blue-grey-darken-4">
                  {{ user.ho_ten }}
                </h2>
                <v-chip
                  :color="
                    user.vai_tro === 'admin'
                      ? 'purple-darken-2'
                      : 'blue-darken-2'
                  "
                  size="small"
                  class="mt-1 font-weight-bold text-uppercase"
                  variant="flat"
                >
                  {{
                    user.vai_tro === "admin"
                      ? "Quản trị viên"
                      : "Độc giả thân thiết"
                  }}
                </v-chip>
              </div>
            </div>

            <v-btn
              color="blue-grey-darken-4"
              variant="flat"
              rounded="pill"
              prepend-icon="mdi-account-edit-outline"
              @click="editProfile"
              class="mb-2"
            >
              Chỉnh sửa
            </v-btn>
          </div>

          <!-- Mobile Name View (Shown only on small screens) -->
          <div class="d-sm-none mb-6 text-center">
            <h2 class="text-h5 font-weight-bold">{{ user.ho_ten }}</h2>
            <div
              class="text-caption text-uppercase font-weight-bold text-primary"
            >
              {{ user.vai_tro }}
            </div>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- User Details Grid -->
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <div class="d-flex align-start">
                <v-icon color="grey-darken-1" class="mr-3 mt-1"
                  >mdi-email-outline</v-icon
                >
                <div>
                  <div
                    class="text-caption text-grey-darken-1 font-weight-bold text-uppercase"
                  >
                    Email
                  </div>
                  <div class="text-body-1">{{ user.email }}</div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="d-flex align-start">
                <v-icon color="grey-darken-1" class="mr-3 mt-1"
                  >mdi-phone-outline</v-icon
                >
                <div>
                  <div
                    class="text-caption text-grey-darken-1 font-weight-bold text-uppercase"
                  >
                    Số điện thoại
                  </div>
                  <div class="text-body-1">{{ user.so_dien_thoai }}</div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="d-flex align-start">
                <v-icon color="grey-darken-1" class="mr-3 mt-1"
                  >mdi-map-marker-outline</v-icon
                >
                <div>
                  <div
                    class="text-caption text-grey-darken-1 font-weight-bold text-uppercase"
                  >
                    Địa chỉ
                  </div>
                  <div class="text-body-1">{{ user.dia_chi }}</div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card>

      <!-- 2. SECTION: LOGIC ẨN/HIỆN THEO ROLE -->
      <template v-if="user.vai_tro !== 'admin'">
        <!-- Bảng sách đã mượn -->
        <v-card class="rounded-xl elevation-2 mb-8 border-thin">
          <v-card-title class="px-6 pt-6 pb-2 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-book-clock-outline</v-icon>
            <span class="text-h6 font-weight-bold">Lịch sử mượn sách</span>
          </v-card-title>

          <v-card-text class="px-0">
            <v-table v-if="borrowedBooks.length > 0" hover class="custom-table">
              <thead>
                <tr class="bg-grey-lighten-4">
                  <th
                    class="pl-6 text-left font-weight-bold text-uppercase text-caption text-grey-darken-2"
                  >
                    Sách
                  </th>
                  <th
                    class="text-left font-weight-bold text-uppercase text-caption text-grey-darken-2"
                  >
                    Thông tin mượn
                  </th>
                  <th
                    class="text-left font-weight-bold text-uppercase text-caption text-grey-darken-2"
                  >
                    Hạn trả
                  </th>
                  <th
                    class="text-left font-weight-bold text-uppercase text-caption text-grey-darken-2"
                  >
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in borrowedBooks" :key="book._id">
                  <td class="pl-6 py-4">
                    <div class="d-flex align-center">
                      <v-avatar rounded="lg" size="60" class="mr-4 elevation-1">
                        <v-img :src="book.book.anh_bia" cover></v-img>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold text-body-2">
                          {{ book.book.ten_sach }}
                        </div>
                        <div class="text-caption text-grey">
                          SL: {{ book.so_luong || 1 }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4">
                    <div class="text-caption">
                      <span class="font-weight-medium">Mượn:</span>
                      {{ formatDate(book.ngay_muon) }}
                    </div>
                    <div class="text-caption" v-if="book.ngay_tra">
                      <span class="font-weight-medium">Đã trả:</span>
                      {{ formatDate(book.ngay_tra) }}
                    </div>
                    <div
                      v-if="book.tien_phat > 0"
                      class="text-error font-weight-bold text-caption mt-1"
                    >
                      Phạt:
                      {{
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(book.tien_phat)
                      }}
                    </div>
                  </td>
                  <td class="py-4 font-weight-medium">
                    {{ formatDate(book.han_tra) }}
                  </td>
                  <td class="py-4">
                    <v-chip
                      :color="getStatusColor(book.trang_thai)"
                      variant="tonal"
                      size="small"
                      class="font-weight-bold"
                    >
                      {{ getStatusText(book.trang_thai) }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div v-else class="text-center py-8">
              <v-icon size="60" color="grey-lighten-2" class="mb-3"
                >mdi-book-open-blank-variant</v-icon
              >
              <p class="text-grey text-body-1">Bạn chưa mượn quyển sách nào.</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Đánh giá đã viết -->
        <v-card class="rounded-xl elevation-2 border-thin">
          <v-card-title
            class="px-6 pt-6 pb-2 d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center">
              <v-icon color="amber-darken-2" class="mr-2"
                >mdi-star-circle-outline</v-icon
              >
              <span class="text-h6 font-weight-bold">Đánh giá của bạn</span>
            </div>
            <!-- Alert Message Mini -->
            <v-fade-transition>
              <v-chip
                v-if="deleteMessage"
                color="success"
                variant="flat"
                size="small"
              >
                <v-icon start icon="mdi-check-circle"></v-icon>
                {{ deleteMessage }}
              </v-chip>
            </v-fade-transition>
          </v-card-title>

          <v-card-text class="px-6 py-4">
            <div v-if="reviews.length" class="review-grid">
              <v-card
                v-for="(review, index) in reviews"
                :key="index"
                variant="outlined"
                class="rounded-lg pa-4 mb-4 bg-grey-lighten-5 border-dashed"
              >
                <div class="d-flex justify-space-between align-start mb-2">
                  <h4 class="font-weight-bold text-subtitle-1">
                    {{ review.bookTitle }}
                  </h4>
                  <v-btn
                    icon="mdi-delete-outline"
                    size="x-small"
                    color="grey"
                    variant="text"
                    @click="deleteReview(review._id)"
                    v-tooltip="'Xóa đánh giá'"
                  ></v-btn>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-rating
                    :model-value="review.rating"
                    color="amber"
                    density="compact"
                    size="small"
                    readonly
                    half-increments
                  ></v-rating>
                  <span class="text-caption text-grey ml-2">{{
                    review.date
                  }}</span>
                </div>
                <p class="text-body-2 text-grey-darken-3">
                  "{{ review.comment }}"
                </p>
              </v-card>
            </div>
            <div v-else class="text-center py-6">
              <p class="text-grey italic">Bạn chưa viết đánh giá nào.</p>
            </div>
          </v-card-text>
        </v-card>
      </template>

      <!-- Dialog chỉnh sửa (Giữ nguyên logic) -->
      <v-dialog
        v-model="editDialog"
        max-width="500"
        persistent
        transition="dialog-bottom-transition"
      >
        <v-card class="rounded-xl pa-2">
          <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
            Chỉnh sửa hồ sơ
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <v-alert
              v-if="serverError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ serverError }}
            </v-alert>

            <div class="d-flex justify-center mb-6">
              <div class="position-relative">
                <v-avatar size="100" class="border">
                  <v-img
                    :src="editForm.avatar || user.avatar || defaultAvatar"
                    cover
                  ></v-img>
                </v-avatar>
                <v-btn
                  icon="mdi-camera"
                  size="small"
                  color="white"
                  class="position-absolute camera-btn elevation-2"
                  @click="$refs.fileInput.click()"
                ></v-btn>
                <!-- Hidden File Input -->
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="d-none"
                  @change="handleAvatarUpload"
                />
              </div>
            </div>

            <v-text-field
              v-model="editForm.name"
              label="Họ tên"
              variant="outlined"
              density="comfortable"
              color="primary"
              prepend-inner-icon="mdi-account"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="editForm.email"
              label="Email"
              variant="outlined"
              density="comfortable"
              color="primary"
              prepend-inner-icon="mdi-email"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="editForm.phone"
              label="Số điện thoại"
              variant="outlined"
              density="comfortable"
              color="primary"
              prepend-inner-icon="mdi-phone"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="editForm.address"
              label="Địa chỉ"
              variant="outlined"
              density="comfortable"
              color="primary"
              prepend-inner-icon="mdi-map-marker"
            ></v-text-field>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey-darken-1" @click="closeDialog"
              >Hủy bỏ</v-btn
            >
            <v-btn
              color="black"
              variant="flat"
              class="px-6 rounded-lg"
              @click="saveProfile"
              >Lưu thay đổi</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
import api from "@/services/api.service";
import { uploadToCloundinary } from "@/utils/uploadToCloudinary";

export default {
  name: "UserProfile",
  data() {
    return {
      user: null,
      borrowedBooks: [],
      reviews: [],
      editDialog: false,
      editForm: {
        name: "",
        email: "",
        phone: "",
        address: "",
        avatar: null,
      },
      serverError: "",
      deleteMessage: "",
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/8345/8345328.png",
    };
  },
  mounted() {
    this.fetchUserProfile();
    // Logic fetch borrows và comments sẽ được kiểm tra bên trong
    // nhưng để an toàn, ta có thể gọi luôn, vì API backend thường tự filter theo token người dùng
    // hoặc xử lý ở phương thức fetch bên dưới.
    this.fetchUserBorrows();
    this.fetchUserComments();
  },
  methods: {
    // ---- UI HELPER METHODS ----
    getStatusColor(status) {
      switch (status) {
        case "pending":
          return "warning";
        case "borrowing":
          return "blue";
        case "returned":
          return "success";
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
        default:
          return "Không xác định";
      }
    },

    // ---- LOGIC METHODS (GIỮ NGUYÊN) ----
    async deleteReview(commentId) {
      if (!confirm("Bạn có chắc muốn xoá đánh giá này?")) return;

      try {
        await api.delete(`/api/comments/${commentId}`);
        this.reviews = this.reviews.filter((r) => r._id !== commentId);
        this.deleteMessage = "Đánh giá đã được xoá thành công";
        setTimeout(() => {
          this.deleteMessage = "";
        }, 3000);
      } catch (error) {
        console.error("Lỗi khi xoá đánh giá:", error);
      }
    },
    async handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const uploadedUrl = await uploadToCloundinary(file, "image");
          this.editForm.avatar = uploadedUrl;
        } catch (err) {
          console.error("❌ Upload ảnh thất bại:", err);
          this.serverError = "❌ Upload ảnh thất bại. Vui lòng thử lại.";
        }
      }
    },
    editProfile() {
      if (this.user) {
        this.editForm = {
          name: this.user.ho_ten,
          email: this.user.email,
          phone: this.user.so_dien_thoai,
          address: this.user.dia_chi,
          avatar: this.user.avatar || "",
        };
        this.editDialog = true;
      }
    },
    closeDialog() {
      this.editDialog = false;
      this.serverError = "";
    },
    async saveProfile() {
      try {
        if (
          !this.editForm.name ||
          !this.editForm.email ||
          !this.editForm.phone ||
          !this.editForm.address
        ) {
          this.serverError = "❗ Vui lòng nhập đầy đủ thông tin";
          return;
        }
        const payload = {
          ho_ten: this.editForm.name,
          email: this.editForm.email,
          so_dien_thoai: this.editForm.phone,
          dia_chi: this.editForm.address,
          avatar: this.editForm.avatar || this.user.avatar,
          vai_tro: this.user.vai_tro,
        };

        const response = await api.put(`/api/users/${this.user._id}`, payload);
        this.user = response.data;
        this.editDialog = false;
        // alert("✅ Cập nhật thông tin thành công!"); // Có thể bỏ alert này cho trải nghiệm mượt hơn
        this.serverError = "";
        await this.fetchUserProfile();
      } catch (error) {
        this.serverError =
          error.response?.data?.message ||
          "❌ Cập nhật không thành công. Vui lòng thử lại.";
      }
    },
    async fetchUserProfile() {
      try {
        const response = await api.get("/api/users/profile");
        this.user = response.data;
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
        this.$router.push("/login");
      }
    },
    async fetchUserComments() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id; // Lưu ý: check lại key 'id' hay '_id' trong localStorage của bạn

        if (!userId) return;

        const response = await api.get(`/api/comments/users/${userId}`);
        this.reviews = response.data.map((item) => ({
          bookTitle: item.ten_sach,
          rating: item.ti_le,
          comment: item.noi_dung,
          date: this.formatDate(item.ngay_tao),
          _id: item._id,
        }));
      } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
      }
    },
    async fetchUserBorrows() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id; // Lưu ý: check lại key 'id' hay '_id'
        if (!userId) return;

        const response = await api.get(`/api/borrows/user/${userId}`);
        this.borrowedBooks = response.data || [];
      } catch (error) {
        console.error("Lỗi khi tải thông tin mượn:", error);
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("vi-VN") : "---";
    },
  },
};
</script>

<style scoped>
/* 1. Tạo nền Gradient cho Cover Image */
.profile-cover {
  height: 180px;
  background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%);
  width: 100%;
}

/* 2. Style Avatar để đè lên Cover */
.profile-avatar {
  border: 5px solid white;
  background-color: white;
}

/* 3. Nút camera trong dialog edit */
.camera-btn {
  bottom: 0;
  right: 0;
  background-color: #212121 !important;
}

/* 4. Tùy chỉnh Table */
.custom-table th {
  letter-spacing: 0.05em;
}

.border-thin {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.border-dashed {
  border-style: dashed !important;
}
</style>
