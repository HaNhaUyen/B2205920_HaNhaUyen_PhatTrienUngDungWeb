<template>
  <div class="chart-wrapper">
    <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
    <p v-else class="text-center text-grey">Đang tải dữ liệu...</p>
  </div>
</template>

<script>
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần cần thiết cho biểu đồ tròn
ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: "BorrowStatusChart",
  components: {
    Doughnut,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom", // Chú thích nằm dưới
            labels: {
              usePointStyle: true, // Dùng hình tròn thay vì hình chữ nhật
              padding: 20,
              font: {
                family: "'Roboto', sans-serif",
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                let value = context.parsed;
                let total = context.chart._metasets[context.datasetIndex].total;
                let percentage = ((value / total) * 100).toFixed(1) + "%";
                return label + value + " phiếu (" + percentage + ")";
              },
            },
          },
        },
        cutout: "75%", // Tạo lỗ rỗng ở giữa (Doughnut style)
      },
    };
  },
};
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 300px;
}
</style>
