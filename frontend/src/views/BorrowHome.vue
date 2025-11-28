<template>
  <v-app>
    <BookSlider :books="sliderBooks" />
    <CategoryCarousel />
    <TopBooks :books="topBooksList" />
    <BookList :books="generalBooksList" />
    <FeatureHighlight />
    <CallToAction />
    <FooterInfo />
  </v-app>
</template>

<script>
import CategoryCarousel from "@/components/CategoryCarousel.vue";
import BookList from "@/components/BookList.vue";
import FeatureHighlight from "@/components/FeatureHighlight.vue";
import CallToAction from "@/components/CallToAction.vue";
import FooterInfo from "@/components/FooterInfo.vue";
import TopBooks from "@/components/TopBooks.vue";
import BookSlider from "@/components/BookSlider.vue"; // Component Slider
import api from "@/services/api.service";

export default {
  name: "BorrowHome",
  components: {
    BookSlider,
    FeatureHighlight,
    BookList,
    FooterInfo,
    CategoryCarousel,
    CallToAction,
    TopBooks,
  },
  data() {
    return {
      sliderBooks: [], // Dữ liệu cho BookSlider (Top 3)
      topBooksList: [], // Dữ liệu cho TopBooks (Các cuốn tiếp theo)
      generalBooksList: [], // Dữ liệu sách chung (sau khi lọc category)
    };
  },
  methods: {
    // Lấy sách chung và sách theo category
    async fetchGeneralBooks() {
      try {
        const category = this.$route.query.category;
        const response = await api.get("/api/books", {
          params: category ? { category } : {},
        });
        this.generalBooksList = response.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách sách chung:", error);
        this.generalBooksList = [];
      }
    },

    // Lấy sách nổi bật để chia cho Slider và TopBooks
    async fetchFeaturedAndTopBooks() {
      try {
        // GIẢ ĐỊNH: Endpoint API này trả về 8 cuốn sách nổi bật/bán chạy
        const response = await api.get("/api/books/featured", {
          params: { limit: 8 },
        });

        // Phân chia dữ liệu:
        this.sliderBooks = response.data.slice(0, 3); // 3 cuốn đầu cho Slider
        this.topBooksList = response.data.slice(3); // Các cuốn còn lại cho TopBooks
      } catch (error) {
        console.error("Lỗi khi tải sách nổi bật:", error);
        this.sliderBooks = [];
        this.topBooksList = [];
      }
    },
  },
  watch: {
    // Theo dõi sự thay đổi category từ CategoryCarousel
    "$route.query.category": {
      immediate: true,
      handler() {
        this.fetchGeneralBooks(); // Chỉ cần cập nhật danh sách sách chung
      },
    },
  },
  created() {
    this.fetchGeneralBooks();
    this.fetchFeaturedAndTopBooks();
  },
};
</script>
