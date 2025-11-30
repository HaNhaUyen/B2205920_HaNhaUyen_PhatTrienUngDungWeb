<template>
  <v-container class="fill-height bg-grey-lighten-5 py-10" fluid>
    <div class="w-100" style="max-width: 1000px; margin: 0 auto" v-if="user">
      <!-- 1. SECTION: PROFILE CARD -->
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
              <!-- Avatar người dùng -->
              <v-avatar size="120" class="profile-avatar elevation-4">
                <v-img
                  :src="user.anh_dai_dien || user.avatar || defaultAvatar"
                  alt="Avatar"
                  cover
                ></v-img>
              </v-avatar>
              <!-- Info người dùng (chỉ hiện trên sm+) -->
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

            <!-- Button chỉnh sửa profile -->
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

          <!-- Mobile Name View (chỉ hiện trên sm-) -->
          <div class="d-sm-none mb-6 text-center">
            <h2 class="text-h5 font-weight-bold">{{ user.ho_ten }}</h2>
            <div
              class="text-caption text-uppercase font-weight-bold text-primary"
            >
              {{ user.vai_tro }}
            </div>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- User Details Grid: Full Fields -->
          <v-row>
            <!-- Giới tính -->
            <v-col cols="12" sm="6" md="4">
              <div class="d-flex align-start">
                <v-icon color="grey-darken-1" class="mr-3 mt-1"
                  >mdi-gender-male-female</v-icon
                >
                <div>
                  <div
                    class="text-caption text-grey-darken-1 font-weight-bold text-uppercase"
                  >
                    Giới tính
                  </div>
                  <div class="text-body-1">{{ user.phai || "---" }}</div>
                </div>
              </div>
            </v-col>

            <!-- Ngày sinh -->
            <v-col cols="12" sm="6" md="4">
              <div class="d-flex align-start">
                <v-icon color="grey-darken-1" class="mr-3 mt-1"
                  >mdi-cake-variant-outline</v-icon
                >
                <div>
                  <div
                    class="text-caption text-grey-darken-1 font-weight-bold text-uppercase"
                  >
                    Ngày sinh
                  </div>
                  <div class="text-body-1">
                    {{ formatDate(user.ngaysinh) }}
                  </div>
                </div>
              </div>
            </v-col>

            <!-- Số điện thoại -->
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

            <!-- Email -->
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

            <!-- Địa chỉ -->
            <v-col cols="12" sm="12" md="8">
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
        <!-- 2b. Đánh giá đã viết -->
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

      <!-- 3. Dialog chỉnh sửa profile -->
      <v-dialog
        v-model="editDialog"
        max-width="600"
        persistent
        transition="dialog-bottom-transition"
      >
        <v-card class="rounded-xl pa-2">
          <v-card-title class="text-h6 font-weight-bold pa-4 pb-2"
            >Chỉnh sửa hồ sơ</v-card-title
          >

          <v-card-text class="pa-4 pt-0">
            <!-- Error alert -->
            <v-alert
              v-if="serverError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              >{{ serverError }}</v-alert
            >

            <!-- Avatar upload -->
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
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="d-none"
                  @change="handleAvatarUpload"
                />
              </div>
            </div>

            <!-- Edit form -->
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="editForm.name"
                  label="Họ và tên"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  prepend-inner-icon="mdi-account"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editForm.phai"
                  :items="['Nam', 'Nữ']"
                  label="Giới tính"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  prepend-inner-icon="mdi-gender-male-female"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editForm.ngaysinh"
                  label="Ngày sinh"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  prepend-inner-icon="mdi-calendar"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editForm.phone"
                  label="Số điện thoại"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  prepend-inner-icon="mdi-phone"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editForm.email"
                  label="Email"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  prepend-inner-icon="mdi-email"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="editForm.address"
                  label="Địa chỉ"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  prepend-inner-icon="mdi-map-marker"
                ></v-text-field>
              </v-col>
            </v-row>
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

      <!-- 4. THÊM SNACKBAR THÔNG BÁO THÀNH CÔNG -->
      <v-snackbar
        v-model="snackbar"
        color="success"
        timeout="3000"
        location="top right"
        variant="flat"
        elevation="4"
      >
        <div class="d-flex align-center">
          <v-icon start icon="mdi-check-circle" class="mr-2"></v-icon>
          <span class="font-weight-medium">{{ snackbarMessage }}</span>
        </div>
        <template v-slot:actions>
          <v-btn
            color="white"
            variant="text"
            icon="mdi-close"
            @click="snackbar = false"
          ></v-btn>
        </template>
      </v-snackbar>
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
      user: null, // Thông tin user hiện tại
      reviews: [], // Danh sách đánh giá của user
      editDialog: false, // trạng thái dialog edit
      editForm: {
        name: "",
        email: "",
        phone: "",
        address: "",
        phai: "",
        ngaysinh: "",
        avatar: null,
      },
      serverError: "", // Hiển thị lỗi server
      deleteMessage: "", // Hiển thị message khi xóa review
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/8345/8345328.png", // avatar default

      // --- Thêm biến cho snackbar ---
      snackbar: false,
      snackbarMessage: "",
    };
  },
  mounted() {
    this.fetchUserProfile();
    this.fetchUserBorrows();
    this.fetchUserComments();
  },
  methods: {
    /* ------------------ UI Helper ------------------ */
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

    /* ------------------ Logic ------------------ */
    async deleteReview(commentId) {
      if (!confirm("Bạn có chắc muốn xoá đánh giá này?")) return;
      try {
        await api.delete(`/api/comments/${commentId}`);
        this.reviews = this.reviews.filter((r) => r._id !== commentId);
        this.deleteMessage = "Đánh giá đã được xoá thành công";
        setTimeout(() => (this.deleteMessage = ""), 3000);
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
          phai: this.user.phai,
          // Chuyển format date ISO về YYYY-MM-DD cho input date
          ngaysinh: this.user.ngaysinh
            ? new Date(this.user.ngaysinh).toISOString().split("T")[0]
            : "",
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
      if (
        !this.editForm.name ||
        !this.editForm.email ||
        !this.editForm.phone ||
        !this.editForm.address ||
        !this.editForm.phai ||
        !this.editForm.ngaysinh
      ) {
        this.serverError = "❗ Vui lòng nhập đầy đủ thông tin";
        return;
      }

      const payload = {
        ho_ten: this.editForm.name,
        email: this.editForm.email,
        so_dien_thoai: this.editForm.phone,
        dia_chi: this.editForm.address,
        phai: this.editForm.phai,
        ngaysinh: this.editForm.ngaysinh,
        avatar: this.editForm.avatar || this.user.avatar,
        vai_tro: this.user.vai_tro,
      };

      try {
        const response = await api.put(`/api/users/${this.user._id}`, payload);
        this.user = response.data;
        this.editDialog = false;
        this.serverError = "";

        // --- Hiển thị thông báo thành công ---
        this.snackbarMessage = "Cập nhật hồ sơ thành công!";
        this.snackbar = true;

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
        const userId = user?.id; // Kiểm tra id trong localStorage
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
        const userId = user?.id;
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
.profile-cover {
  height: 180px;
  background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%);
  width: 100%;
}

.profile-avatar {
  border: 5px solid white;
  background-color: white;
}

.camera-btn {
  bottom: 0;
  right: 0;
  background-color: #212121 !important;
}

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
