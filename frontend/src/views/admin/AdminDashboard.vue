<template>
  <v-container fluid class="pa-8 bg-grey-lighten-5 h-100">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-gradient mb-2">
        Tổng Quan Quản Trị
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        Chào mừng trở lại! Dưới đây là số liệu hoạt động mới nhất của thư viện.
      </p>
    </div>

    <!-- Stats Cards Section -->
    <v-row class="mb-4">
      <!-- Card: Tổng độc giả -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-3 card-hover border-thin"
          color="white"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <div
                class="text-overline font-weight-bold text-medium-emphasis mb-1"
              >
                TỔNG ĐỘC GIẢ
              </div>
              <div class="text-h3 font-weight-bold text-blue-grey-darken-3">
                {{ dashboardData.totalReaders }}
              </div>
            </div>
            <v-avatar color="blue-lighten-5" size="60" class="rounded-lg">
              <v-icon color="blue-darken-2" size="32"
                >mdi-account-group-outline</v-icon
              >
            </v-avatar>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="d-flex align-center">
            <v-icon size="small" color="blue" class="mr-1"
              >mdi-trending-up</v-icon
            >
            <span class="text-caption text-medium-emphasis"
              >Cập nhật thời gian thực</span
            >
          </div>
        </v-card>
      </v-col>

      <!-- Card: Tổng sách -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-3 card-hover border-thin"
          color="white"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <div
                class="text-overline font-weight-bold text-medium-emphasis mb-1"
              >
                KHO SÁCH
              </div>
              <div class="text-h3 font-weight-bold text-blue-grey-darken-3">
                {{ dashboardData.totalBooks }}
              </div>
            </div>
            <v-avatar
              color="emerald-lighten-5"
              style="background-color: #e0f2f1"
              size="60"
              class="rounded-lg"
            >
              <v-icon color="teal-darken-2" size="32"
                >mdi-book-open-page-variant-outline</v-icon
              >
            </v-avatar>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="d-flex align-center">
            <v-icon size="small" color="teal" class="mr-1"
              >mdi-check-circle-outline</v-icon
            >
            <span class="text-caption text-medium-emphasis"
              >Sẵn sàng phục vụ</span
            >
          </div>
        </v-card>
      </v-col>

      <!-- Card: Tổng đơn mượn -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-3 card-hover border-thin"
          color="white"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <div
                class="text-overline font-weight-bold text-medium-emphasis mb-1"
              >
                ĐANG MƯỢN
              </div>
              <div class="text-h3 font-weight-bold text-blue-grey-darken-3">
                {{ dashboardData.totalBorrows }}
              </div>
            </div>
            <v-avatar color="amber-lighten-5" size="60" class="rounded-lg">
              <v-icon color="orange-darken-3" size="32"
                >mdi-clipboard-text-clock-outline</v-icon
              >
            </v-avatar>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="d-flex align-center">
            <v-icon size="small" color="orange" class="mr-1"
              >mdi-clock-outline</v-icon
            >
            <span class="text-caption text-medium-emphasis">Yêu cầu xử lý</span>
          </div>
        </v-card>
      </v-col>

      <!-- Card: Tổng tiền phạt (Đã đồng bộ logic) -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-3 card-hover border-thin"
          color="white"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <div
                class="text-overline font-weight-bold text-medium-emphasis mb-1"
              >
                TIỀN PHẠT
              </div>
              <div class="text-h3 font-weight-bold text-red-accent-4">
                {{ dashboardData.totalFines.toLocaleString("vi-VN") }} đ
              </div>
            </div>
            <v-avatar color="red-lighten-5" size="60" class="rounded-lg">
              <v-icon color="red-darken-2" size="32">mdi-cash-multiple</v-icon>
            </v-avatar>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="d-flex align-center">
            <span class="text-caption text-medium-emphasis ml-auto">
              Bao gồm cả phí dự kiến
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts & Tables Section -->
    <v-row>
      <!-- Chart Section -->
      <v-col cols="12">
        <v-card class="pa-6 rounded-xl elevation-3 border-thin" color="white">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h5 font-weight-bold text-blue-grey-darken-3">
                Thống kê mượn sách
              </h2>
              <p class="text-subtitle-2 text-medium-emphasis">
                Dữ liệu trong 7 ngày gần nhất
              </p>
            </div>
            <v-btn
              variant="tonal"
              color="primary"
              class="text-capitalize"
              rounded="lg"
              prepend-icon="mdi-refresh"
              @click="fetchDashboardData"
            >
              Làm mới
            </v-btn>
          </div>
          <div class="chart-container">
            <BorrowChart v-if="chartData" :chart-data="chartData" />
          </div>
        </v-card>
      </v-col>

      <!-- Recent Users Table -->
      <v-col cols="12" md="6">
        <v-card
          class="fill-height rounded-xl elevation-3 border-thin d-flex flex-column"
          color="white"
        >
          <v-card-title class="pa-6 pb-2">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-2"
                >mdi-account-clock-outline</v-icon
              >
              <span class="font-weight-bold text-h6 text-blue-grey-darken-3"
                >Độc giả mới</span
              >
            </div>
          </v-card-title>

          <v-card-text class="pa-0 flex-grow-1">
            <v-table class="custom-table">
              <thead>
                <tr class="bg-grey-lighten-5">
                  <th
                    class="text-left font-weight-bold text-caption text-uppercase py-4 pl-6"
                  >
                    Thông tin
                  </th>
                  <th
                    class="text-left font-weight-bold text-caption text-uppercase py-4"
                  >
                    Liên hệ
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="reader in dashboardData.recentUsers"
                  :key="reader._id"
                  class="table-row-hover"
                >
                  <td class="py-4 pl-6">
                    <div class="d-flex align-center">
                      <v-avatar color="indigo-lighten-4" size="40" class="mr-3">
                        <span class="text-indigo-darken-2 font-weight-bold">{{
                          reader.ho_ten.charAt(0)
                        }}</span>
                      </v-avatar>
                      <div>
                        <div
                          class="font-weight-bold text-body-2 text-high-emphasis"
                        >
                          {{ reader.ho_ten }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ reader.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      {{ reader.so_dien_thoai }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Top Rated Books Table -->
      <v-col cols="12" md="6">
        <v-card
          class="fill-height rounded-xl elevation-3 border-thin d-flex flex-column"
          color="white"
        >
          <v-card-title class="pa-6 pb-2">
            <div class="d-flex align-center">
              <!-- Icon Vương miện hoặc Sao -->
              <v-icon color="amber-darken-2" class="mr-2"
                >mdi-crown-outline</v-icon
              >
              <span class="font-weight-bold text-h6 text-blue-grey-darken-3"
                >Top sách đánh giá cao</span
              >
            </div>
          </v-card-title>

          <v-card-text class="pa-0 flex-grow-1">
            <v-table class="custom-table">
              <thead>
                <tr class="bg-grey-lighten-5">
                  <th
                    class="text-left font-weight-bold text-caption text-uppercase py-4 pl-6"
                  >
                    Tên sách
                  </th>
                  <th
                    class="text-right font-weight-bold text-caption text-uppercase py-4 pr-6"
                  >
                    Đánh giá
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(book, index) in dashboardData.topBooks"
                  :key="index"
                  class="table-row-hover"
                >
                  <td class="py-4 pl-6">
                    <div class="d-flex align-center">
                      <!-- Số thứ tự top -->
                      <v-avatar
                        size="24"
                        :color="
                          index === 0
                            ? 'amber'
                            : index === 1
                            ? 'grey-lighten-1'
                            : index === 2
                            ? 'brown-lighten-2'
                            : 'grey-lighten-3'
                        "
                        class="mr-3 text-caption font-weight-bold text-white elevation-1"
                      >
                        {{ index + 1 }}
                      </v-avatar>
                      <div>
                        <div
                          class="font-weight-bold text-body-2 text-high-emphasis mb-1 line-clamp-1"
                        >
                          {{ book.ten_sach }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ book.ten_tac_gia }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 pr-6 text-right">
                    <div class="d-flex flex-column align-end">
                      <div class="d-flex align-center">
                        <span
                          class="font-weight-bold mr-1 text-amber-darken-3"
                          >{{ book.avgRating.toFixed(1) }}</span
                        >
                        <v-rating
                          :model-value="book.avgRating"
                          color="amber"
                          density="compact"
                          half-increments
                          readonly
                          size="x-small"
                        ></v-rating>
                      </div>
                      <span class="text-caption text-grey">
                        ({{ book.totalReviews }} lượt)
                      </span>
                    </div>
                  </td>
                </tr>
                <!-- Hiển thị khi chưa có đánh giá nào -->
                <tr
                  v-if="
                    !dashboardData.topBooks ||
                    dashboardData.topBooks.length === 0
                  "
                >
                  <td colspan="2" class="text-center py-6 text-grey">
                    Chưa có dữ liệu đánh giá
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AdminLayout from "@/components/admin/AdminLayout.vue";
import BorrowChart from "@/components/admin/BorrowChart.vue";
import api from "@/services/api.service";

export default {
  name: "AdminDashboard",
  components: {
    AdminLayout,
    BorrowChart,
  },
  data() {
    return {
      dashboardData: {
        totalReaders: 0,
        totalBooks: 0,
        totalBorrows: 0,
        totalFines: 0,
        recentUsers: [],
        topBooks: [], // <--- Sửa tên từ recentBooks thành topBooks
        borrowStatsLast7Days: [],
      },
      chartData: null,
    };
  },
  created() {
    this.fetchDashboardData();
  },
  methods: {
    // --- COPY LOGIC TÍNH TOÁN TỪ BorrowManager.vue ---

    // 1. Tính hạn trả (Nếu DB thiếu thì +14 ngày)
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

    // 2. Tính tiền phạt (5000đ/ngày)
    calculateFine(borrow) {
      if (borrow.trang_thai === "pending") return 0;

      const dueDateStr = this.calculateDueDate(borrow);
      if (!dueDateStr) return 0;

      const dueDate = new Date(dueDateStr);
      let returnDate;

      // Xác định ngày so sánh
      if (borrow.trang_thai === "returned") {
        const realReturnDate = borrow.ngay_tra_thuc_te || borrow.ngay_tra;
        if (!realReturnDate) return 0;
        returnDate = new Date(realReturnDate);
      } else {
        // Đang mượn -> Tính đến hiện tại
        returnDate = new Date();
      }

      dueDate.setHours(0, 0, 0, 0);
      returnDate.setHours(0, 0, 0, 0);

      if (returnDate <= dueDate) return 0;

      const diffTime = returnDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays * 5000;
    },
    // ------------------------------------------------

    async fetchDashboardData() {
      try {
        // Gọi song song: Lấy tổng quan (cho số lượng) VÀ lấy danh sách phiếu mượn (để tính tiền)
        const [overviewRes, borrowsRes] = await Promise.all([
          api.get("/api/dashboard/overview"),
          api.get("/api/borrows"), // API lấy tất cả phiếu mượn
        ]);

        this.dashboardData = overviewRes.data;

        // --- ĐỒNG BỘ TIỀN PHẠT ---
        const allBorrows = borrowsRes.data;
        let totalRealtimeFines = 0;

        // Duyệt qua tất cả phiếu mượn để tính tổng tiền phạt theo logic realtime
        allBorrows.forEach((borrow) => {
          totalRealtimeFines += this.calculateFine(borrow);
        });

        // Ghi đè tổng tiền phạt hiển thị
        this.dashboardData.totalFines = totalRealtimeFines;
        // -------------------------

        // --- XỬ LÝ BIỂU ĐỒ ---
        const stats = overviewRes.data.borrowStatsLast7Days;
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - (6 - i));
          return date;
        });

        const formatDateKey = (date) => {
          const y = date.getFullYear();
          const m = (date.getMonth() + 1).toString().padStart(2, "0");
          const d = date.getDate().toString().padStart(2, "0");
          return `${y}-${m}-${d}`;
        };

        const formatLabel = (date) => {
          const d = date.getDate().toString().padStart(2, "0");
          const m = (date.getMonth() + 1).toString().padStart(2, "0");
          return `${d}/${m}`;
        };

        const countMap = {};
        stats.forEach((item) => {
          countMap[item._id] = item.count;
        });

        const labels = last7Days.map(formatLabel);
        const data = last7Days.map((date) => {
          const key = formatDateKey(date);
          return countMap[key] || 0;
        });

        this.chartData = {
          labels,
          datasets: [
            {
              label: "Sách mượn",
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.ctx;
                const gradient = canvas.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
                gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
                return gradient;
              },
              borderColor: "#3B82F6",
              pointBackgroundColor: "#FFFFFF",
              pointBorderColor: "#3B82F6",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              data,
              fill: true,
              tension: 0.4,
              borderWidth: 3,
            },
          ],
        };
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      }
    },
  },
};
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(to right, #1e3c72, #2a5298);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-hover {
  transition: all 0.3s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
}

.border-thin {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.table-row-hover:hover td {
  background-color: #fafafa;
  transition: background-color 0.2s ease;
}

.custom-table th {
  font-family: "Roboto", sans-serif;
  letter-spacing: 0.05em;
  color: #64748b !important;
}

.v-table__wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.v-table__wrapper::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 4px;
}
</style>
