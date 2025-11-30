<template>
  <div
    class="min-h-screen flex justify-center items-center bg-gray-50 py-10 px-4"
  >
    <v-card
      class="w-full max-w-3xl rounded-xl shadow-lg bg-white overflow-hidden"
      elevation="0"
    >
      <!-- Header -->
      <div class="bg-black text-white p-6 text-center">
        <v-icon size="40" class="mb-2">mdi-calendar-edit</v-icon>
        <h2 class="text-2xl font-bold uppercase tracking-wide">
          Chỉnh sửa Phiếu Mượn
        </h2>
      </div>

      <div class="p-8">
        <!-- Loading -->
        <div v-if="!initialValues" class="text-center py-10">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
          <p class="mt-2 text-gray-500">Đang tải dữ liệu...</p>
        </div>

        <!-- Message -->
        <span
          v-if="message && !snackbar"
          :class="{
            'text-green-600': messageType === 'success',
            'text-red-600': messageType === 'error',
            'block text-center mb-4 font-medium': true,
          }"
        >
          {{ message }}
        </span>

        <!-- Form: Thêm v-slot="{ setFieldValue }" để có thể cập nhật chéo các trường -->
        <Form
          v-if="initialValues"
          :key="formKey"
          @submit="submitForm"
          :initial-values="initialValues"
          :validation-schema="schema"
          v-slot="{ setFieldValue }"
        >
          <v-row dense>
            <!-- 1. Độc giả -->
            <v-col cols="12" md="6">
              <Field name="userId" v-slot="{ field, errors }">
                <v-select
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  :items="users"
                  item-title="ho_ten"
                  item-value="_id"
                  label="Độc giả"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 2. Sách -->
            <v-col cols="12" md="6">
              <Field name="bookId" v-slot="{ field, errors }">
                <v-select
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  :items="books"
                  item-title="ten_sach"
                  item-value="_id"
                  label="Tên sách"
                  prepend-inner-icon="mdi-book-open-variant"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

            <!-- 3. Ngày mượn (Đã sửa logic cập nhật) -->
            <v-col cols="12" md="4">
              <Field name="borrowDate" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="
                    (val) => {
                      field.handleChange(val); // Cập nhật ngày mượn

                      // Tính ngày trả dự kiến = ngày mượn + 14
                      const newDueDate = calculateDueDate(val);
                      // Cập nhật trường dueDate
                      setFieldValue('dueDate', newDueDate);
                    }
                  "
                  label="Ngày mượn"
                  type="date"
                  prepend-inner-icon="mdi-calendar-arrow-right"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 4. Hạn trả -->
            <v-col cols="12" md="4">
              <Field name="dueDate" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Hạn trả (Dự kiến)"
                  type="date"
                  prepend-inner-icon="mdi-calendar-clock"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 5. Ngày trả thực tế -->
            <v-col cols="12" md="4">
              <Field name="returnDate" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Ngày trả thực tế"
                  type="date"
                  prepend-inner-icon="mdi-calendar-check"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                  clearable
                />
              </Field>
            </v-col>

            <!-- 6. Tiền phạt -->
            <v-col cols="12" md="6">
              <Field name="fine" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Tiền phạt (VNĐ)"
                  type="number"
                  prepend-inner-icon="mdi-cash-remove"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 7. Trạng thái -->
            <v-col cols="12" md="6">
              <Field name="status" v-slot="{ field, errors }">
                <v-select
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  :items="[
                    { title: 'Chờ duyệt', value: 'pending' },
                    { title: 'Đang mượn', value: 'borrowing' },
                    { title: 'Đã trả', value: 'returned' },
                    { title: 'Đã hủy', value: 'rejected' },
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Trạng thái"
                  prepend-inner-icon="mdi-list-status"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>
          </v-row>

          <!-- Buttons -->
          <div class="flex items-center gap-4 mt-6">
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              height="48"
              class="flex-1 font-weight-bold"
              @click="$router.push('/admin/borrows')"
            >
              Hủy
            </v-btn>

            <v-btn
              type="submit"
              color="black"
              height="48"
              class="flex-1 text-white font-weight-bold"
              elevation="2"
            >
              Cập nhật
            </v-btn>
          </div>
        </Form>

        <!-- Snackbar thông báo -->
        <v-snackbar
          v-model="snackbar"
          :timeout="2000"
          :color="messageType === 'success' ? 'green darken-1' : 'red darken-1'"
          top
          right
        >
          {{ message }}
          <template #actions>
            <v-btn text @click="snackbar = false">Đóng</v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-card>
  </div>
</template>

<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import api from "@/services/api.service";

export default {
  components: { Form, Field },
  data() {
    return {
      formKey: 0,
      initialValues: null,
      message: "",
      messageType: "",
      snackbar: false,
      users: [],
      books: [],
      schema: yup.object({
        userId: yup.string().required("Vui lòng chọn độc giả"),
        bookId: yup.string().required("Vui lòng chọn sách"),
        borrowDate: yup.string().required("Chọn ngày mượn"),
        dueDate: yup.string().nullable(),
        returnDate: yup.string().nullable(),
        fine: yup.number().min(0).required("Tiền phạt không hợp lệ"),
        status: yup.string().required("Chọn trạng thái"),
      }),
    };
  },
  created() {
    this.fetchInitialData();
  },
  methods: {
    // Hàm tiện ích: Tính ngày trả = ngày mượn + 14 ngày
    calculateDueDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 14); // Cộng 14 ngày
      return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
    },

    async fetchInitialData() {
      const id = this.$route.params.id;
      try {
        const [borrowRes, usersRes, booksRes] = await Promise.all([
          api.get(`/api/borrows/${id}`),
          api.get("/api/users"),
          api.get("/api/books"),
        ]);

        const borrow = borrowRes.data;
        const borrowDateStr = borrow.ngay_muon
          ? borrow.ngay_muon.split("T")[0]
          : "";

        // Nếu trong DB chưa có hạn trả, tự động tính toán
        let dueDateStr = borrow.han_tra ? borrow.han_tra.split("T")[0] : "";
        if (!dueDateStr && borrowDateStr) {
          dueDateStr = this.calculateDueDate(borrowDateStr);
        }

        this.initialValues = {
          userId: borrow.ma_doc_gia,
          bookId: borrow.ma_sach,
          borrowDate: borrowDateStr,
          dueDate: dueDateStr,
          returnDate: borrow.ngay_tra_thuc_te
            ? borrow.ngay_tra_thuc_te.split("T")[0]
            : borrow.ngay_tra
            ? borrow.ngay_tra.split("T")[0]
            : "",
          fine: borrow.tien_phat || 0,
          status: borrow.trang_thai,
        };

        this.users = usersRes.data;
        this.books = booksRes.data;
        this.formKey++;
      } catch (err) {
        this.showMessage(
          "Lỗi khi tải dữ liệu: " +
            (err.response?.data?.message || err.message),
          "error"
        );
      }
    },

    showMessage(msg, type) {
      this.message = msg;
      this.messageType = type;
      this.snackbar = true;
    },

    async submitForm(values) {
      const id = this.$route.params.id;
      try {
        let finalReturnDate = values.returnDate;
        if (values.status === "borrowing" || values.status === "pending") {
          finalReturnDate = null;
        }

        const payload = {
          ma_doc_gia: values.userId,
          ma_sach: values.bookId,
          ngay_muon: values.borrowDate,
          han_tra: values.dueDate,
          tien_phat: values.fine,
          trang_thai: values.status,
          ngay_tra: finalReturnDate,
          ngay_tra_thuc_te: finalReturnDate,
        };

        await api.put(`/api/borrows/${id}`, payload);

        this.showMessage("Cập nhật phiếu mượn thành công!", "success");

        setTimeout(() => {
          this.$router.push("/admin/borrows");
        }, 1000);
      } catch (err) {
        this.showMessage(
          err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.",
          "error"
        );
      }
    },
  },
};
</script>

<style scoped>
.v-field--variant-outlined .v-field__outline {
  --v-field-border-opacity: 0.3;
}
</style>
