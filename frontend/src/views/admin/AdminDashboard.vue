<template>
  <v-container fluid class="pa-6 bg-grey-lighten-5 min-h-screen">
    <!-- Header Section -->
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-end mb-8"
    >
      <div>
        <h1 class="text-h4 font-weight-bold text-blue-grey-darken-4 mb-1">
          Tổng Quan Quản Trị
        </h1>
        <p class="text-body-1 text-grey-darken-1">
          Số liệu hoạt động thư viện ngày
          {{ new Date().toLocaleDateString("vi-VN") }}
        </p>
      </div>
      <div class="mt-4 mt-sm-0">
        <v-btn
          color="white"
          variant="flat"
          class="text-none font-weight-bold border"
          prepend-icon="mdi-refresh"
          @click="fetchDashboardData"
          :loading="loading"
        >
          Làm mới dữ liệu
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards Section -->
    <v-row class="mb-2">
      <!-- Card: Tổng độc giả -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-2 border-thin card-hover h-100"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <p
                class="text-caption font-weight-bold text-grey mb-1 text-uppercase"
              >
                Tổng độc giả
              </p>
              <h3 class="text-h4 font-weight-bold text-blue-grey-darken-3">
                {{ dashboardData.totalReaders }}
              </h3>
            </div>
            <v-sheet
              color="blue-lighten-5"
              class="rounded-lg d-flex align-center justify-center"
              width="48"
              height="48"
            >
              <v-icon color="blue-darken-2" size="24">mdi-account-group</v-icon>
            </v-sheet>
          </div>
          <div
            class="mt-4 pt-2 border-t d-flex align-center text-caption text-grey"
          >
            <v-icon size="16" color="blue" class="mr-1"
              >mdi-account-check</v-icon
            >
            <span>Tài khoản hoạt động</span>
          </div>
        </v-card>
      </v-col>

      <!-- Card: Kho sách -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-2 border-thin card-hover h-100"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <p
                class="text-caption font-weight-bold text-grey mb-1 text-uppercase"
              >
                Kho sách
              </p>
              <h3 class="text-h4 font-weight-bold text-blue-grey-darken-3">
                {{ dashboardData.totalBooks }}
              </h3>
            </div>
            <v-sheet
              color="teal-lighten-5"
              class="rounded-lg d-flex align-center justify-center"
              width="48"
              height="48"
            >
              <v-icon color="teal-darken-2" size="24"
                >mdi-book-open-page-variant</v-icon
              >
            </v-sheet>
          </div>
          <div
            class="mt-4 pt-2 border-t d-flex align-center text-caption text-grey"
          >
            <v-icon size="16" color="teal" class="mr-1">mdi-bookshelf</v-icon>
            <span>Đầu sách sẵn sàng</span>
          </div>
        </v-card>
      </v-col>

      <!-- Card: Đang mượn -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-2 border-thin card-hover h-100"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <p
                class="text-caption font-weight-bold text-grey mb-1 text-uppercase"
              >
                Đang mượn
              </p>
              <h3 class="text-h4 font-weight-bold text-blue-grey-darken-3">
                {{ dashboardData.totalBorrows }}
              </h3>
            </div>
            <v-sheet
              color="amber-lighten-5"
              class="rounded-lg d-flex align-center justify-center"
              width="48"
              height="48"
            >
              <v-icon color="orange-darken-3" size="24"
                >mdi-clipboard-clock</v-icon
              >
            </v-sheet>
          </div>
          <div
            class="mt-4 pt-2 border-t d-flex align-center text-caption text-grey"
          >
            <v-icon size="16" color="orange" class="mr-1"
              >mdi-clock-alert</v-icon
            >
            <span>Cần theo dõi hạn trả</span>
          </div>
        </v-card>
      </v-col>

      <!-- Card: Tiền phạt -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-4 rounded-xl elevation-2 border-thin card-hover h-100"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <p
                class="text-caption font-weight-bold text-grey mb-1 text-uppercase"
              >
                Tổng tiền phạt
              </p>
              <h3 class="text-h4 font-weight-bold text-red-accent-4">
                {{ formatCompactNumber(dashboardData.totalFines) }}
              </h3>
            </div>
            <v-sheet
              color="red-lighten-5"
              class="rounded-lg d-flex align-center justify-center"
              width="48"
              height="48"
            >
              <v-icon color="red-darken-2" size="24">mdi-cash-multiple</v-icon>
            </v-sheet>
          </div>
          <div
            class="mt-4 pt-2 border-t d-flex align-center text-caption text-grey"
          >
            <span class="text-blue-grey">Chi tiết: </span>
            <span class="ml-1 font-weight-bold text-red-darken-1"
              >{{ dashboardData.totalFines.toLocaleString("vi-VN") }} đ</span
            >
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- CHARTS SECTION -->
    <v-row class="mb-4">
      <!-- Cột 1: Biểu đồ Cột (7 Ngày) - Chiếm 8 phần -->
      <v-col cols="12" md="8">
        <v-card class="pa-5 rounded-xl elevation-2 border-thin h-100">
          <div class="mb-6">
            <h3 class="text-h6 font-weight-bold text-blue-grey-darken-3">
              Xu hướng mượn sách
            </h3>
            <p class="text-caption text-grey">
              Thống kê số lượng mượn trong 7 ngày gần nhất
            </p>
          </div>
          <div class="chart-container" style="height: 320px">
            <BorrowChart v-if="chartData" :chart-data="chartData" />
          </div>
        </v-card>
      </v-col>

      <!-- Cột 2: Biểu đồ Tròn (Trạng thái) - Chiếm 4 phần -->
      <v-col cols="12" md="4">
        <v-card class="pa-5 rounded-xl elevation-2 border-thin h-100">
          <div class="mb-6">
            <h3 class="text-h6 font-weight-bold text-blue-grey-darken-3">
              Tỷ lệ trạng thái
            </h3>
            <p class="text-caption text-grey">
              Phân bố các phiếu mượn theo tình trạng
            </p>
          </div>
          <div
            class="d-flex flex-column align-center justify-center"
            style="height: 320px"
          >
            <!-- Component Biểu đồ Tròn Mới -->
            <BorrowStatusChart
              v-if="pieChartData"
              :chart-data="pieChartData"
              style="width: 100%; max-width: 300px"
            />
            <div v-else class="d-flex flex-column align-center text-grey">
              <v-progress-circular
                indeterminate
                color="primary"
                class="mb-2"
              ></v-progress-circular>
              <span class="text-caption">Đang tải biểu đồ...</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tables Section -->
    <v-row>
      <!-- Độc giả mới -->
      <v-col cols="12" md="6">
        <v-card class="rounded-xl elevation-2 border-thin h-100">
          <v-card-item class="py-4 px-6 border-b">
            <template v-slot:prepend>
              <v-avatar color="indigo-lighten-5" size="32" class="mr-2">
                <v-icon color="indigo" size="18">mdi-account-plus</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">
              Độc giả mới đăng ký
            </v-card-title>
          </v-card-item>

          <v-table class="custom-table bg-transparent">
            <tbody>
              <tr
                v-for="reader in dashboardData.recentUsers"
                :key="reader._id"
                class="hover-row"
              >
                <td class="py-3 pl-6">
                  <div class="d-flex align-center">
                    <v-avatar color="grey-lighten-3" size="40" class="mr-3">
                      <span class="text-indigo font-weight-bold text-body-1">{{
                        reader.ho_ten.charAt(0)
                      }}</span>
                    </v-avatar>
                    <div>
                      <div
                        class="font-weight-bold text-body-2 text-blue-grey-darken-3"
                      >
                        {{ reader.ho_ten }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ reader.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-right pr-6">
                  <v-chip
                    size="x-small"
                    color="indigo"
                    variant="flat"
                    class="font-weight-bold"
                    >Mới</v-chip
                  >
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <!-- Top sách đánh giá cao -->
      <v-col cols="12" md="6">
        <v-card class="rounded-xl elevation-2 border-thin h-100">
          <v-card-item class="py-4 px-6 border-b">
            <template v-slot:prepend>
              <v-avatar color="amber-lighten-5" size="32" class="mr-2">
                <v-icon color="amber-darken-3" size="18">mdi-star</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">
              Top sách được yêu thích
            </v-card-title>
          </v-card-item>

          <v-table class="custom-table bg-transparent">
            <tbody>
              <tr
                v-for="(book, index) in dashboardData.topBooks"
                :key="index"
                class="hover-row"
              >
                <td class="py-3 pl-6">
                  <div class="d-flex align-center">
                    <div
                      class="font-weight-black text-grey-lighten-1 mr-4 text-h6"
                      style="width: 20px"
                    >
                      {{ index + 1 }}
                    </div>
                    <div>
                      <div
                        class="font-weight-bold text-body-2 text-blue-grey-darken-3 line-clamp-1"
                      >
                        {{ book.ten_sach }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ book.ten_tac_gia }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-right pr-6">
                  <div class="d-flex align-center justify-end">
                    <span class="font-weight-bold mr-1 text-body-2">{{
                      book.avgRating.toFixed(1)
                    }}</span>
                    <v-icon color="amber" size="x-small">mdi-star</v-icon>
                  </div>
                  <div class="text-[10px] text-grey">
                    {{ book.totalReviews }} đánh giá
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AdminLayout from "@/components/admin/AdminLayout.vue";
import BorrowChart from "@/components/admin/BorrowChart.vue";
import BorrowStatusChart from "@/components/admin/BorrowStatusChart.vue"; // Component biểu đồ tròn
import api from "@/services/api.service";

export default {
  name: "AdminDashboard",
  components: {
    AdminLayout,
    BorrowChart,
    BorrowStatusChart,
  },
  data() {
    return {
      loading: false,
      dashboardData: {
        totalReaders: 0,
        totalBooks: 0,
        totalBorrows: 0,
        totalFines: 0,
        recentUsers: [],
        topBooks: [],
        borrowStatsLast7Days: [],
      },
      chartData: null,
      pieChartData: null, // Dữ liệu cho biểu đồ tròn
    };
  },
  created() {
    this.fetchDashboardData();
  },
  methods: {
    formatCompactNumber(number) {
      return new Intl.NumberFormat("vi-VN", {
        notation: "compact",
        compactDisplay: "short",
      }).format(number);
    },

    // Logic tính hạn trả (từ BorrowManager)
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

    // Logic tính tiền phạt (từ BorrowManager)
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

    async fetchDashboardData() {
      this.loading = true;
      try {
        const [overviewRes, borrowsRes] = await Promise.all([
          api.get("/api/dashboard/overview"),
          api.get("/api/borrows"),
        ]);

        this.dashboardData = overviewRes.data;
        const allBorrows = borrowsRes.data;

        // 1. Tính tổng tiền phạt
        let totalRealtimeFines = 0;
        allBorrows.forEach((borrow) => {
          totalRealtimeFines += this.calculateFine(borrow);
        });
        this.dashboardData.totalFines = totalRealtimeFines;

        // 2. Xử lý Dữ liệu Biểu đồ Tròn (Trạng thái)
        const statusCounts = {
          pending: 0, // Chờ duyệt
          borrowing: 0, // Đang mượn
          returned: 0, // Đã trả
          gap_su_co: 0, // Bị sự cố
          da_xu_ly: 0, // Đã xử lý (nếu có)
        };

        allBorrows.forEach((b) => {
          if (statusCounts[b.trang_thai] !== undefined) {
            statusCounts[b.trang_thai]++;
          }
        });

        // Mapping dữ liệu vào ChartJS
        this.pieChartData = {
          labels: ["Đang mượn", "Đã trả", "Chờ duyệt", "Sự cố", "Đã xử lý"],
          datasets: [
            {
              backgroundColor: [
                "#2196F3", // Đang mượn (Xanh dương)
                "#4CAF50", // Đã trả (Xanh lá)
                "#FF9800", // Chờ duyệt (Cam)
                "#F44336", // Sự cố (Đỏ)
                "#9E9E9E", // Đã xử lý (Xám)
              ],
              data: [
                statusCounts.borrowing,
                statusCounts.returned,
                statusCounts.pending,
                statusCounts.gap_su_co,
                statusCounts.da_xu_ly,
              ],
              hoverOffset: 6,
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        };

        // 3. Xử lý Dữ liệu Biểu đồ Cột (7 ngày)
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
              label: "Lượt mượn",
              backgroundColor: "#3B82F6",
              borderRadius: 6,
              data,
              barThickness: 24,
            },
          ],
        };
      } catch (error) {
        console.error("Lỗi dashboard:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}

.border-thin {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.hover-row:hover td {
  background-color: #f8fafc;
}

.custom-table th {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
