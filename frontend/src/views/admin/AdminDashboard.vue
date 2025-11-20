<template>
  <v-container fluid class="pa-6">
    <h1 class="text-h4 font-weight-bold mb-6 text-primary">
      Tổng Quan Quản Trị
    </h1>

    <v-row justify="space-between" class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-5 elevation-4 rounded-lg dashboard-card"
          color="white"
          hover
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <h2 class="text-subtitle-2 text-medium-emphasis mb-1">
                Tổng độc giả
              </h2>
              <p class="text-h4 font-weight-semibold text-onSurface">
                {{ dashboardData.totalReaders }}
              </p>
            </div>
            <v-icon size="40" color="blue-darken-1">mdi-account-group</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-5 elevation-4 rounded-lg dashboard-card"
          color="white"
          hover
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <h2 class="text-subtitle-2 text-medium-emphasis mb-1">
                Tổng sách
              </h2>
              <p class="text-h4 font-weight-semibold text-onSurface">
                {{ dashboardData.totalBooks }}
              </p>
            </div>
            <v-icon size="40" color="green-darken-1">mdi-bookshelf</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-5 elevation-4 rounded-lg dashboard-card"
          color="white"
          hover
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <h2 class="text-subtitle-2 text-medium-emphasis mb-1">
                Tổng đơn mượn
              </h2>
              <p class="text-h4 font-weight-semibold text-onSurface">
                {{ dashboardData.totalBorrows }}
              </p>
            </div>
            <v-icon size="40" color="orange-darken-1"
              >mdi-clipboard-list</v-icon
            >
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="pa-5 elevation-4 rounded-lg dashboard-card"
          color="white"
          hover
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <h2 class="text-subtitle-2 text-medium-emphasis mb-1">
                Tổng tiền phạt
              </h2>
              <p class="text-h4 font-weight-semibold text-error">
                {{ dashboardData.totalFines.toLocaleString() }}đ
              </p>
            </div>
            <v-icon size="40" color="red-darken-1">mdi-cash-remove</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-6 elevation-4 rounded-xl">
          <h2 class="text-h6 font-weight-semibold mb-4 text-onSurface">
            Độc giả gần đây
          </h2>
          <v-table class="w-100 table-responsive">
            <thead>
              <tr class="text-subtitle-2 text-medium-emphasis">
                <th class="py-2 text-left font-weight-medium">Tên</th>
                <th class="py-2 text-left font-weight-medium">Email</th>
                <th class="py-2 text-left font-weight-medium">SĐT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reader in dashboardData.recentUsers" :key="reader._id">
                <td class="py-3">{{ reader.ho_ten }}</td>
                <td class="py-3">{{ reader.email }}</td>
                <td class="py-3">{{ reader.so_dien_thoai }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-6 elevation-4 rounded-xl">
          <h2 class="text-h6 font-weight-semibold mb-4 text-onSurface">
            Sách mới gần đây
          </h2>
          <v-table class="w-100 table-responsive">
            <thead>
              <tr class="text-subtitle-2 text-medium-emphasis">
                <th class="py-2 text-left font-weight-medium">Tên sách</th>
                <th class="py-2 text-left font-weight-medium">Tác giả</th>
                <th class="py-2 text-left font-weight-medium">Thể loại</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in dashboardData.recentBooks" :key="book._id">
                <td class="py-3">{{ book.ten_sach }}</td>
                <td class="py-3">{{ book.author.ho_ten }}</td>
                <td class="py-3">{{ book.category.ten_the_loai }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12">
        <v-card class="pa-6 elevation-4 rounded-xl">
          <h2 class="text-h6 font-weight-semibold mb-4 text-onSurface">
            Thống kê Sách Mượn (7 Ngày Gần Nhất)
          </h2>
          <BorrowChart :chart-data="chartData" />
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
        recentBooks: [],
        borrowStatsLast7Days: [],
      },
      chartData: null,
    };
  },
  created() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const response = await api.get("/api/dashboard/overview");
        console.log(response);

        this.dashboardData = response.data;
        const stats = response.data.borrowStatsLast7Days;

        // Tạo danh sách 7 ngày gần nhất
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

        // Tạo map từ dữ liệu thống kê trả về
        const countMap = {};
        stats.forEach((item) => {
          countMap[item._id] = item.count;
        });

        // Tạo dữ liệu biểu đồ đầy đủ 7 ngày
        const labels = last7Days.map(formatLabel);
        const data = last7Days.map((date) => {
          const key = formatDateKey(date);
          return countMap[key] || 0;
        });

        this.chartData = {
          labels,
          datasets: [
            {
              label: "Số sách mượn",
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "#3B82F6",
              data,
              fill: true,
              tension: 0.3,
            },
          ],
        };
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      }
    },
  },
  // XÓA LOGIC RELOAD TỰ ĐỘNG KHÔNG CẦN THIẾT
  /* mounted() {
        if (!sessionStorage.getItem('reloaded')) {
            sessionStorage.setItem('reloaded', 'true');
            window.location.reload();
        } else {
            sessionStorage.removeItem('reloaded');
        }
    }, */
};
</script>
