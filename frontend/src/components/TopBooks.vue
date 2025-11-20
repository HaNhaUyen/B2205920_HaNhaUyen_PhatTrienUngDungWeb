<template>
  <v-container class="py-10">
    <h2 class="text-center font-weight-bold text-h4 mb-8 text-primary">
      <v-icon start large>mdi-star-box-multiple</v-icon>
      Sách Nổi Bật
    </h2>

    <v-row>
      <v-col
        v-for="(book, index) in books"
        :key="book._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <v-card
          class="book-item-card flex-grow-1 elevation-6 rounded-lg d-flex flex-column"
          hover
          :to="`/books/${book._id}`"
        >
          <v-img
            :src="
              book.anh_bia ||
              'https://via.placeholder.com/400x600?text=No+Cover'
            "
            height="280px"
            cover
            class="book-cover-image"
          >
            <div class="image-gradient-overlay"></div>
          </v-img>

          <v-card-title
            class="text-h6 font-weight-bold text-primary px-4 pt-3 pb-0 text-truncate"
          >
            {{ book.ten_sach }}
          </v-card-title>
          <v-card-subtitle
            class="text-subtitle-2 text-medium-emphasis px-4 pb-2 text-truncate"
          >
            Tác giả: {{ book.ten_tac_gia }}
          </v-card-subtitle>

          <v-card-text
            v-if="book.the_loai"
            class="px-4 py-0 text-caption text-onSurfaceVariant"
          >
            Thể loại:
            <span class="font-weight-medium">{{
              book.the_loai.ten_the_loai
            }}</span>
          </v-card-text>

          <v-spacer></v-spacer>
          <v-card-actions class="px-4 py-2 d-flex align-center">
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              size="small"
              class="text-none font-weight-bold"
              @click.stop="goToBookDetail(book._id)"
            >
              <v-icon start>mdi-information-outline</v-icon>
              Chi tiết
            </v-btn>

            <v-spacer></v-spacer>

            <v-btn
              icon
              size="small"
              variant="text"
              color="grey-darken-1"
              @click.stop="toggleExpand(index)"
            >
              <v-icon>{{
                expanded[index] ? "mdi-chevron-up" : "mdi-chevron-down"
              }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <div v-show="expanded[index]">
              <v-divider class="mx-4"></v-divider>
              <v-card-text class="text-body-2 text-onSurfaceVariant pb-3">
                <span class="font-weight-medium">Mô tả:</span>
                {{
                  book.mo_ta && book.mo_ta.length > 150
                    ? book.mo_ta.substring(0, 150) + "..."
                    : book.mo_ta
                }}
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch, defineComponent } from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "BookList",
  props: {
    books: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const expanded = ref([]);
    const router = useRouter();

    // Đồng bộ số lượng sách -> số lượng phần tử mở rộng
    watch(
      () => props.books,
      (newBooks) => {
        expanded.value = newBooks.map(() => false);
      },
      { immediate: true }
    );
    const goToBookDetail = (bookId) => {
      router.push(`/books/${bookId}`);
    };
    const toggleExpand = (index) => {
      expanded.value[index] = !expanded.value[index];
    };

    return { expanded, toggleExpand, goToBookDetail };
  },
});
</script>
