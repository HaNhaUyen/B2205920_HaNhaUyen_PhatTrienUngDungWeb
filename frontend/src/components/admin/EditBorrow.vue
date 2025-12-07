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
        <v-icon size="40" class="mb-2">mdi-file-document-edit</v-icon>
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

        <!-- Form -->
        <Form
          v-if="initialValues"
          :key="formKey"
          @submit="submitForm"
          :initial-values="initialValues"
          :validation-schema="schema"
          v-slot="{ values, setFieldValue }"
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
                  variant="outlined"
                  density="comfortable"
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
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

            <!-- 3. Số lượng -->
            <v-col cols="12" md="4">
              <Field name="quantity" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Số lượng"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 4. Ngày mượn -->
            <v-col cols="12" md="4">
              <Field name="borrowDate" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="
                    (val) => {
                      field.handleChange(val);
                      // Khi đổi ngày mượn -> Tự động tính lại Hạn trả (Ngày mượn + 14)
                      const newDueDate = calculateAutoDueDate(val);
                      setFieldValue('dueDate', newDueDate);

                      // Tính lại tiền phạt
                      const newFine = calculateFineExact(
                        val,
                        newDueDate,
                        values.returnDate,
                        values.status
                      );
                      setFieldValue('fine', newFine);
                    }
                  "
                  label="Ngày mượn"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 5. Hạn trả -->
            <v-col cols="12" md="4">
              <Field name="dueDate" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="
                    (val) => {
                      field.handleChange(val);
                      // Khi đổi hạn trả -> Tính lại tiền phạt
                      const newFine = calculateFineExact(
                        values.borrowDate,
                        val,
                        values.returnDate,
                        values.status
                      );
                      setFieldValue('fine', newFine);
                    }
                  "
                  label="Hạn trả (Dự kiến)"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 6. Trạng thái -->
            <v-col cols="12">
              <Field name="status" v-slot="{ field, errors }">
                <v-select
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="
                    (val) => {
                      field.handleChange(val);

                      let newReturnDate = values.returnDate;

                      // Nếu chọn 'Đang mượn' -> Xóa ngày trả
                      if (val === 'borrowing') {
                        newReturnDate = null;
                        setFieldValue('returnDate', null);
                      }
                      // Nếu chọn 'Đã trả' mà chưa có ngày -> Gán hôm nay
                      else if (val === 'returned' && !newReturnDate) {
                        newReturnDate = new Date().toISOString().split('T')[0];
                        setFieldValue('returnDate', newReturnDate);
                      }

                      // Tính lại tiền phạt
                      const newFine = calculateFineExact(
                        values.borrowDate,
                        values.dueDate,
                        newReturnDate,
                        val
                      );
                      setFieldValue('fine', newFine);
                    }
                  "
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  label="Trạng thái Phiếu Mượn"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors"
                  class="mb-1 font-weight-bold"
                />
              </Field>
            </v-col>

            <!-- SECTION: NGÀY TRẢ & TIỀN PHẠT -->
            <v-col
              cols="12"
              md="6"
              v-if="!['gap_su_co'].includes(values.status)"
            >
              <Field name="returnDate" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="
                    (val) => {
                      field.handleChange(val);
                      // Khi đổi ngày trả -> Tính lại tiền phạt
                      const newFine = calculateFineExact(
                        values.borrowDate,
                        values.dueDate,
                        val,
                        values.status
                      );
                      setFieldValue('fine', newFine);
                    }
                  "
                  label="Ngày trả thực tế"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors"
                  class="mb-1"
                  clearable
                  :disabled="values.status === 'borrowing'"
                />
              </Field>
            </v-col>

            <v-col
              cols="12"
              md="6"
              v-if="!['gap_su_co'].includes(values.status)"
            >
              <Field name="fine" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  label="Tiền phạt trễ hạn (VNĐ)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors"
                  class="mb-1 font-weight-bold text-red"
                  readonly
                  bg-color="grey-lighten-4"
                />
              </Field>
            </v-col>

            <!-- (Phần Sự Cố giữ nguyên như cũ, không đổi) -->
            <v-col
              cols="12"
              v-if="['gap_su_co', 'da_xu_ly'].includes(values.status)"
              class="bg-red-50 p-4 rounded-lg border border-red-200 mt-2 mb-4"
            >
              <h3 class="text-red-800 font-bold mb-3 flex items-center">
                <v-icon color="red-darken-2" class="mr-2"
                  >mdi-alert-circle</v-icon
                >
                Thông tin Sự Cố & Đền Bù
              </h3>
              <v-row dense>
                <!-- Giữ nguyên code phần sự cố của bạn -->
                <v-col cols="12" md="6">
                  <Field name="issueType" v-slot="{ field }">
                    <v-select
                      v-bind="field"
                      :model-value="field.value"
                      @update:model-value="field.handleChange"
                      label="Loại sự cố"
                      :items="[
                        { title: 'Mất sách', value: 'mat_sach' },
                        { title: 'Hư hỏng', value: 'hu_hong' },
                      ]"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      bg-color="white"
                    ></v-select>
                  </Field>
                </v-col>
                <v-col cols="12" md="6">
                  <Field name="compensationMethod" v-slot="{ field }">
                    <v-select
                      v-bind="field"
                      :model-value="field.value"
                      @update:model-value="field.handleChange"
                      label="Phương án đền bù"
                      :items="[
                        { title: 'Tự mua bản mới', value: 'tu_mua' },
                        { title: 'Đền tiền', value: 'den_tien' },
                      ]"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      bg-color="white"
                    ></v-select>
                  </Field>
                </v-col>
                <v-col cols="12" md="6">
                  <Field name="compensationFee" v-slot="{ field }">
                    <v-text-field
                      v-bind="field"
                      :model-value="field.value"
                      @update:model-value="field.handleChange"
                      label="Phí đền bù (VNĐ)"
                      type="number"
                      variant="outlined"
                      density="compact"
                      bg-color="white"
                      suffix="đ"
                    ></v-text-field>
                  </Field>
                </v-col>
                <v-col cols="12">
                  <Field name="adminNote" v-slot="{ field }">
                    <v-textarea
                      v-bind="field"
                      :model-value="field.value"
                      @update:model-value="field.handleChange"
                      label="Ghi chú Admin"
                      rows="2"
                      variant="outlined"
                      bg-color="white"
                    ></v-textarea>
                  </Field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

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

        <v-snackbar
          v-model="snackbar"
          :timeout="2000"
          :color="messageType === 'success' ? 'green darken-1' : 'red darken-1'"
          top
          right
        >
          {{ message }}
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
      statusOptions: [
        { title: "Chờ duyệt", value: "pending" },
        { title: "Đang mượn", value: "borrowing" },
        { title: "Đã trả", value: "returned" },
        { title: "Gặp sự cố", value: "gap_su_co" },
        { title: "Đã xử lý (Xong)", value: "da_xu_ly" },
        { title: "Đã hủy", value: "rejected" },
      ],
      schema: yup.object({
        userId: yup.string().required("Vui lòng chọn độc giả"),
        bookId: yup.string().required("Vui lòng chọn sách"),
        quantity: yup.number().typeError("Phải là số").required().min(1),
        borrowDate: yup.string().required("Chọn ngày mượn"),
        status: yup.string().required("Chọn trạng thái"),
        dueDate: yup.string().nullable(),
        returnDate: yup.string().nullable(),
        fine: yup.number().nullable(),
        issueType: yup.string().nullable(),
        compensationMethod: yup.string().nullable(),
        compensationFee: yup.number().nullable(),
        adminNote: yup.string().nullable(),
      }),
    };
  },
  created() {
    this.fetchInitialData();
  },
  methods: {
    // --- 1. Tự động tính hạn trả (Ngày mượn + 14 ngày) ---
    calculateAutoDueDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      // Cộng 14 ngày
      date.setDate(date.getDate() + 14);
      return date.toISOString().split("T")[0];
    },

    // --- 2. LOGIC TÍNH TIỀN PHẠT (Đồng bộ 100% với BorrowManager) ---
    calculateFineExact(borrowDate, dueDate, returnDate, status) {
      // Logic: Nếu đang chờ duyệt hoặc đang xử lý sự cố -> Không tính
      if (status === "pending" || status === "gap_su_co") return 0;

      // Nếu không có hạn trả -> Không tính được
      if (!dueDate) return 0;

      const dDeadline = new Date(dueDate);
      if (isNaN(dDeadline.getTime())) return 0;
      dDeadline.setHours(0, 0, 0, 0);

      // Xác định ngày để so sánh
      let dCompare;

      // Nếu đã trả hoặc đã xử lý -> Dùng ngày trả thực tế
      if (["returned", "da_xu_ly"].includes(status)) {
        if (!returnDate) return 0;
        dCompare = new Date(returnDate);
      }
      // Nếu đang mượn -> Dùng ngày hiện tại (Hôm nay) để tính tạm
      else {
        dCompare = new Date();
      }

      if (isNaN(dCompare.getTime())) return 0;
      dCompare.setHours(0, 0, 0, 0);

      // Nếu ngày so sánh <= hạn trả -> Không phạt
      if (dCompare <= dDeadline) return 0;

      // Tính số ngày trễ
      const diffTime = dCompare.getTime() - dDeadline.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays * 5000;
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
        const parseDate = (d) => (d ? d.split("T")[0] : "");

        const borrowDateStr = parseDate(borrow.ngay_muon);
        let dueDateStr = parseDate(borrow.han_tra);

        // Nếu DB chưa có hạn trả, tự tính
        if (!dueDateStr && borrowDateStr) {
          dueDateStr = this.calculateAutoDueDate(borrowDateStr);
        }

        const returnDateStr = parseDate(
          borrow.ngay_tra_thuc_te || borrow.ngay_tra
        );

        // 🔥 QUAN TRỌNG: Tính lại tiền phạt ngay lúc load form để hiển thị đúng
        const currentFine = this.calculateFineExact(
          borrowDateStr,
          dueDateStr,
          returnDateStr,
          borrow.trang_thai
        );

        this.initialValues = {
          userId: borrow.ma_doc_gia,
          bookId: borrow.ma_sach,
          quantity: parseInt(borrow.so_luong) || 1,
          borrowDate: borrowDateStr,
          dueDate: dueDateStr,
          returnDate: returnDateStr,
          fine: currentFine, // Giá trị tính toán (thay vì lấy từ DB cũ)
          status: borrow.trang_thai,

          issueType: borrow.loai_su_co || null,
          compensationMethod: borrow.phuong_an_den_bu || null,
          compensationFee: borrow.phi_den_bu || 0,
          adminNote: borrow.ghi_chu_admin || "",
        };

        this.users = usersRes.data;
        this.books = booksRes.data;
        this.formKey++;
      } catch (err) {
        this.message = "Lỗi tải dữ liệu: " + err.message;
        this.messageType = "error";
        this.snackbar = true;
      }
    },

    async submitForm(values) {
      const id = this.$route.params.id;
      try {
        let finalReturnDate = values.returnDate;

        // Nếu chuyển về đang mượn -> Reset ngày trả
        if (values.status === "borrowing") {
          finalReturnDate = null;
        }

        const payload = {
          ma_doc_gia: values.userId,
          ma_sach: values.bookId,
          so_luong: parseInt(values.quantity),
          ngay_muon: values.borrowDate,
          han_tra: values.dueDate,
          trang_thai: values.status,
          ngay_tra: finalReturnDate,
          ngay_tra_thuc_te: finalReturnDate, // Đồng bộ
          tien_phat: values.fine || 0,

          loai_su_co: values.issueType,
          phuong_an_den_bu: values.compensationMethod,
          phi_den_bu: parseInt(values.compensationFee) || 0,
          ghi_chu_admin: values.adminNote,
        };

        await api.put(`/api/borrows/${id}`, payload);
        this.message = "Cập nhật thành công!";
        this.messageType = "success";
        this.snackbar = true;

        setTimeout(() => {
          this.$router.push("/admin/borrows");
        }, 1000);
      } catch (err) {
        this.message = err.response?.data?.message || "Lỗi cập nhật";
        this.messageType = "error";
        this.snackbar = true;
      }
    },
  },
};
</script>
