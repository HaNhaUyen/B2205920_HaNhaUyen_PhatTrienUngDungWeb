<template>
  <v-container fluid class="bg-grey-lighten-5 min-vh-100 pa-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- Header Section -->
        <div class="d-flex align-center mb-6">
          <v-avatar color="primary" variant="tonal" class="mr-4" rounded>
            <v-icon>mdi-account-cog</v-icon>
          </v-avatar>
          <div>
            <h1
              class="text-h5 text-md-h4 font-weight-bold text-blue-grey-darken-3"
            >
              Quản lý người dùng
            </h1>
            <p class="text-body-2 text-medium-emphasis mt-1">
              Quản lý danh sách độc giả và nhân viên hệ thống
            </p>
          </div>
          <!-- (Gợi ý) Bạn có thể đặt nút Thêm mới ở đây nếu muốn -->
        </div>

        <!-- Main Card with Tabs -->
        <v-card class="rounded-xl elevation-3 overflow-hidden border-thin">
          <!-- Tabs Navigation -->
          <v-tabs
            v-model="activeTab"
            bg-color="white"
            color="primary"
            align-tabs="start"
            class="border-b"
            grow
          >
            <v-tab
              value="readers"
              class="text-capitalize font-weight-bold text-body-1 py-4"
            >
              <v-icon start class="mr-2">mdi-account-group-outline</v-icon>
              Độc giả
              <v-chip
                size="x-small"
                color="primary"
                class="ml-2 font-weight-bold"
                variant="flat"
              >
                <!-- Thêm hiệu ứng loading nhẹ cho con số -->
                <span v-if="!loading">{{ readers.length }}</span>
                <v-progress-circular
                  v-else
                  indeterminate
                  size="12"
                  width="2"
                  color="white"
                ></v-progress-circular>
              </v-chip>
            </v-tab>

            <v-tab
              value="staff"
              class="text-capitalize font-weight-bold text-body-1 py-4"
            >
              <v-icon start class="mr-2">mdi-badge-account-outline</v-icon>
              Nhân viên
              <v-chip
                size="x-small"
                color="secondary"
                class="ml-2 font-weight-bold"
                variant="flat"
              >
                <span v-if="!loading">{{ staff.length }}</span>
                <v-progress-circular
                  v-else
                  indeterminate
                  size="12"
                  width="2"
                  color="white"
                ></v-progress-circular>
              </v-chip>
            </v-tab>
          </v-tabs>

          <!-- Content Area -->
          <v-card-text class="pa-0 bg-white">
            <v-window v-model="activeTab">
              <!-- Tab Độc giả -->
              <v-window-item value="readers">
                <div class="pa-4 pa-md-6">
                  <!-- QUAN TRỌNG: Thêm @refresh="fetchUsers" để lắng nghe sự kiện từ con -->
                  <ReaderList
                    v-if="!initialLoading"
                    :users="readers"
                    @refresh="fetchUsers"
                  />

                  <!-- Skeleton Loading lúc mới vào trang -->
                  <div v-else class="text-center py-10">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                    <p class="text-caption mt-2">Đang tải dữ liệu...</p>
                  </div>
                </div>
              </v-window-item>

              <!-- Tab Nhân viên -->
              <v-window-item value="staff">
                <div class="pa-4 pa-md-6">
                  <!-- QUAN TRỌNG: Thêm @refresh="fetchUsers" -->
                  <StaffList
                    v-if="!initialLoading"
                    :users="staff"
                    @refresh="fetchUsers"
                  />

                  <div v-else class="text-center py-10">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                    <p class="text-caption mt-2">Đang tải dữ liệu...</p>
                  </div>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ReaderList from "./ReaderList.vue";
import StaffList from "./StaffList.vue";
import api from "@/services/api.service";

export default {
  name: "UserManagement",
  components: {
    ReaderList,
    StaffList,
  },
  data() {
    return {
      activeTab: "readers",
      readers: [],
      staff: [],
      loading: false, // Loading khi refresh dữ liệu (thêm/xóa)
      initialLoading: true, // Loading lần đầu vào trang
    };
  },
  methods: {
    async fetchUsers(showLoading = true) {
      if (showLoading) this.loading = true;
      try {
        // Gọi API lấy danh sách mới nhất
        const res = await api.get("/api/users");
        const users = res.data.reverse();

        // Cập nhật lại mảng dữ liệu -> Số lượng tự động thay đổi
        this.readers = users.filter((u) => u.vai_tro === "reader");
        this.staff = users.filter((u) => u.vai_tro === "admin");
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      } finally {
        this.loading = false;
        this.initialLoading = false;
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.border-thin {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.v-window-item {
  transition: all 0.3s ease-in-out;
}
</style>
