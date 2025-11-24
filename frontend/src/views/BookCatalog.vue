<template>
  <v-container fluid class="bg-grey-lighten-5 min-vh-100 py-12">
    <div style="max-width: 1200px; margin: 0 auto">
      <!-- Header Section -->
      <div class="mb-8 text-center text-md-left">
        <h1 class="text-h4 font-weight-bold text-blue-grey-darken-3 mb-2">
          Thư Viện Sách
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          Khám phá kho tàng tri thức với hàng ngàn đầu sách hấp dẫn
        </p>
      </div>

      <!-- Filter Bar -->
      <v-card class="mb-8 pa-4 rounded-xl elevation-2" border>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              placeholder="Tìm kiếm tên sách hoặc tác giả..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              color="primary"
              class="rounded-lg"
              bg-color="grey-lighten-5"
              @input="filterBooks"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedGenre"
              :items="genres"
              label="Thể loại"
              prepend-inner-icon="mdi-shape-outline"
              variant="outlined"
              density="comfortable"
              hide-details
              color="primary"
              bg-color="grey-lighten-5"
              @update:modelValue="filterBooks"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="itemsPerPage"
              :items="[10, 20, 50]"
              label="Hiển thị"
              prepend-inner-icon="mdi-format-list-numbered"
              variant="outlined"
              density="comfortable"
              hide-details
              color="primary"
              bg-color="grey-lighten-5"
              @update:modelValue="updatePagination"
            ></v-select>
          </v-col>
        </v-row>
      </v-card>

      <!-- Book Grid -->
      <div v-if="filteredBooks.length === 0" class="text-center py-16">
        <v-icon size="64" color="grey-lighten-1" class="mb-4"
          >mdi-book-off-outline</v-icon
        >
        <h3 class="text-h6 text-grey-darken-1">Không tìm thấy sách phù hợp</h3>
        <v-btn
          color="primary"
          variant="text"
          @click="resetFilters"
          class="mt-2"
        >
          Xóa bộ lọc
        </v-btn>
      </div>

      <v-row v-else>
        <v-col
          v-for="book in paginatedBooks"
          :key="book._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="book-card h-100 d-flex flex-column rounded-xl border-thin"
            elevation="1"
            hover
          >
            <!-- Image Section -->
            <div
              class="image-wrapper pa-4 bg-grey-lighten-4 d-flex justify-center align-center position-relative"
            >
              <v-img
                :src="book.anh_bia"
                :aspect-ratio="2 / 3"
                width="100%"
                max-width="180"
                cover
                class="rounded-lg elevation-4 book-cover transition-swing"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>

              <!-- Badge Thể loại (Overlay) -->
              <v-chip
                size="small"
                color="primary"
                variant="flat"
                class="category-badge font-weight-bold"
              >
                {{ book.ten_the_loai }}
              </v-chip>
            </div>

            <!-- Content Section -->
            <div class="d-flex flex-column flex-grow-1 px-4 pt-4 pb-2">
              <div class="mb-auto">
                <v-tooltip :text="book.ten_sach" location="top">
                  <template v-slot:activator="{ props }">
                    <h3
                      v-bind="props"
                      class="text-subtitle-1 font-weight-bold text-blue-grey-darken-4 line-clamp-1 mb-1"
                    >
                      {{ book.ten_sach }}
                    </h3>
                  </template>
                </v-tooltip>

                <div
                  class="d-flex align-center text-caption text-medium-emphasis mb-3"
                >
                  <v-icon size="small" class="mr-1">mdi-account-edit</v-icon>
                  <span class="text-truncate">{{ book.ten_tac_gia }}</span>
                </div>
              </div>

              <v-divider class="mb-3"></v-divider>

              <!-- Actions -->
              <div class="d-flex align-center justify-space-between mb-2">
                <router-link
                  :to="`/books/${book._id}`"
                  class="text-decoration-none"
                >
                  <v-btn
                    variant="flat"
                    color="blue-grey-darken-4"
                    size="small"
                    class="text-capitalize px-4 rounded-lg font-weight-bold"
                  >
                    Chi tiết
                  </v-btn>
                </router-link>

                <v-btn
                  variant="text"
                  density="comfortable"
                  icon
                  color="grey-darken-1"
                  @click="toggleExpand(book._id)"
                >
                  <v-icon
                    :class="{ 'rotate-180': expanded[book._id] }"
                    class="transition-transform"
                  >
                    mdi-chevron-down
                  </v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Expandable Description -->
            <v-expand-transition>
              <div v-show="expanded[book._id]" class="bg-grey-lighten-5">
                <v-divider></v-divider>
                <div class="pa-4 text-body-2 text-grey-darken-2">
                  <span
                    class="font-weight-bold text-caption text-uppercase d-block mb-1"
                    >Mô tả:</span
                  >
                  {{ book.mo_ta || "Đang cập nhật mô tả..." }}
                </div>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <div class="mt-12 text-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          active-color="primary"
          variant="flat"
          rounded="circle"
          class="custom-pagination"
          @update:modelValue="updatePagination"
        ></v-pagination>
      </div>
    </div>
  </v-container>
</template>

<script>
import api from "@/services/api.service";

export default {
  name: "BookCatalog",
  data() {
    return {
      searchQuery: "",
      selectedGenre: null,
      itemsPerPage: 12, // Tăng lên 12 để chia hết cho 3 và 4 cột đẹp hơn
      currentPage: 1,
      genres: [],
      books: [],
      filteredBooks: [],
      expanded: {},
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
    },
    paginatedBooks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredBooks.slice(start, end);
    },
  },
  methods: {
    filterBooks() {
      let filtered = this.books;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (book) =>
            book.ten_sach.toLowerCase().includes(query) ||
            book.ten_tac_gia.toLowerCase().includes(query)
        );
      }
      if (this.selectedGenre && this.selectedGenre !== "Tất cả") {
        filtered = filtered.filter(
          (book) => book.ten_the_loai === this.selectedGenre
        );
      }
      this.filteredBooks = filtered;
      this.currentPage = 1;
    },
    resetFilters() {
      this.searchQuery = "";
      this.selectedGenre = "Tất cả";
      this.filterBooks();
    },
    updatePagination() {
      this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
      // Scroll to top smoothly when changing page
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    toggleExpand(bookId) {
      this.expanded = {
        ...this.expanded,
        [bookId]: !this.expanded[bookId],
      };
    },
    async fetchBooksAndGenres() {
      try {
        const booksRes = await api.get("/api/books/details");
        this.books = booksRes.data || [];
        this.genres = [
          "Tất cả",
          ...new Set(this.books.map((g) => g.ten_the_loai)),
        ];
        this.filteredBooks = [...this.books];
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sách/thể loại:", error);
      }
    },
  },
  async created() {
    await this.fetchBooksAndGenres();
  },
};
</script>

<style scoped>
/* 1. Xử lý cắt dòng văn bản */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 2. Hiệu ứng Hover Card */
.book-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

/* 3. Hiệu ứng ảnh bìa */
.image-wrapper {
  overflow: hidden;
}
.book-cover {
  transition: transform 0.5s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}
.book-card:hover .book-cover {
  transform: scale(1.05); /* Phóng to nhẹ ảnh khi hover */
}

/* 4. Category Badge */
.category-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 5. Icon xoay */
.rotate-180 {
  transform: rotate(180deg);
}
.transition-transform {
  transition: transform 0.3s ease;
}

/* 6. Border mỏng tinh tế */
.border-thin {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.min-vh-100 {
  min-height: 100vh;
}
</style>
