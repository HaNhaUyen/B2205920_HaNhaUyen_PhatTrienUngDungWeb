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
        <v-icon size="40" class="mb-2">mdi-account-edit-outline</v-icon>
        <h2 class="text-2xl font-bold uppercase tracking-wide">
          Chỉnh sửa thông tin
        </h2>
      </div>

      <div class="p-8">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-10">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
          <p class="mt-2 text-gray-500">Đang tải dữ liệu...</p>
        </div>

        <!-- Form -->
        <Form
          v-if="!isLoading && initialValues"
          :key="formKey"
          @submit="submitForm"
          :initial-values="initialValues"
          :validation-schema="schema"
        >
          <v-row dense>
            <!-- 1. HỌ TÊN -->
            <v-col cols="12" md="6">
              <Field name="name" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Họ và tên"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 2. SỐ ĐIỆN THOẠI (ĐÃ SỬA) -->
            <v-col cols="12" md="6">
              <Field name="phone" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Số điện thoại"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 3. EMAIL -->
            <v-col cols="12" md="6">
              <Field name="email" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 4. VAI TRÒ -->
            <v-col cols="12" md="6">
              <Field name="role" v-slot="{ field, errors }">
                <v-select
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  :items="['Độc giả', 'admin']"
                  label="Vai trò"
                  prepend-inner-icon="mdi-shield-account"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 5. GIỚI TÍNH -->
            <v-col cols="12" md="6">
              <Field name="gender" v-slot="{ field, errors }">
                <v-select
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  :items="['Nam', 'Nữ']"
                  label="Giới tính"
                  prepend-inner-icon="mdi-gender-male-female"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 6. NGÀY SINH -->
            <v-col cols="12" md="6">
              <Field name="birthdate" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Ngày sinh"
                  type="date"
                  prepend-inner-icon="mdi-cake-variant"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 7. ĐỊA CHỈ -->
            <v-col cols="12">
              <Field name="address" v-slot="{ field, errors }">
                <v-text-field
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  label="Địa chỉ"
                  prepend-inner-icon="mdi-map-marker"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>

            <!-- 8. TRẠNG THÁI -->
            <v-col cols="12">
              <Field name="status" v-slot="{ field, errors }">
                <v-select
                  v-bind="field"
                  :model-value="field.value"
                  @update:model-value="field.handleChange"
                  :items="['Hoạt động', 'Khóa']"
                  label="Trạng thái tài khoản"
                  prepend-inner-icon="mdi-toggle-switch"
                  variant="outlined"
                  density="comfortable"
                  color="black"
                  :error-messages="errors"
                  class="mb-1"
                />
              </Field>
            </v-col>
          </v-row>

          <!-- Buttons Actions -->
          <div class="flex items-center gap-4 mt-6">
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              height="48"
              class="flex-1 font-weight-bold"
              @click="cancelEdit"
            >
              Hủy bỏ
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
      </div>
    </v-card>

    <!-- Snackbar thông báo -->
    <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      :color="messageType === 'success' ? 'green-darken-1' : 'red-darken-1'"
      location="top right"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{
          messageType === "success" ? "mdi-check-circle" : "mdi-alert-circle"
        }}</v-icon>
        {{ message }}
      </div>
    </v-snackbar>
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
      isLoading: true,
      message: "",
      messageType: "",
      snackbar: false,

      schema: yup.object({
        name: yup.string().required("Vui lòng nhập họ tên"),
        email: yup
          .string()
          .email("Email không hợp lệ")
          .required("Vui lòng nhập email"),
        phone: yup.string().required("Vui lòng nhập số điện thoại"),
        address: yup.string().required("Vui lòng nhập địa chỉ"),
        gender: yup.string().required("Vui lòng chọn giới tính"),
        // Fix lỗi ngày sinh: dùng string để nhận chuỗi từ input type="date"
        birthdate: yup
          .string()
          .required("Vui lòng chọn ngày sinh")
          .test("is-valid-date", "Ngày sinh không hợp lệ", (value) => {
            // Kiểm tra nếu chuỗi có thể parse thành ngày
            return !isNaN(Date.parse(value));
          }),
        status: yup.string().required("Vui lòng chọn trạng thái"),
        role: yup.string().required("Vui lòng chọn vai trò"),
      }),
    };
  },

  created() {
    this.fetchUser();
  },

  methods: {
    async fetchUser() {
      const id = this.$route.params.id;
      this.isLoading = true;
      try {
        const response = await api.get(`/api/users/${id}`);
        const user = response.data;

        this.initialValues = {
          name: user.ho_ten || "",
          email: user.email || "",
          phone: user.so_dien_thoai || "",
          address: user.dia_chi || "",
          gender: user.phai || "",
          birthdate: user.ngaysinh ? user.ngaysinh.split("T")[0] : "",
          status: user.trang_thai === "active" ? "Hoạt động" : "Khóa",
          role: user.vai_tro === "admin" ? "admin" : "Độc giả",
        };
        this.formKey++;
      } catch (err) {
        this.showMessage(
          "Lỗi khi tải thông tin: " +
            (err.response?.data?.message || err.message),
          "error"
        );
      } finally {
        this.isLoading = false;
      }
    },

    async submitForm(values) {
      const id = this.$route.params.id;
      try {
        const payload = {
          ho_ten: values.name,
          email: values.email,
          so_dien_thoai: values.phone,
          dia_chi: values.address,
          phai: values.gender,
          ngaysinh: values.birthdate,
          trang_thai: values.status === "Khóa" ? "inactive" : "active",
          vai_tro: values.role === "admin" ? "admin" : "reader",
        };

        await api.put(`/api/users/${id}`, payload);
        this.showMessage("Cập nhật người dùng thành công!", "success");
        setTimeout(() => this.$router.push("/admin/users"), 1000);
      } catch (err) {
        this.showMessage(
          "Lỗi khi cập nhật: " + (err.response?.data?.message || err.message),
          "error"
        );
      }
    },

    cancelEdit() {
      this.$router.push("/admin/users");
    },

    showMessage(msg, type) {
      this.message = msg;
      this.messageType = type;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.v-field--variant-outlined .v-field__outline {
  --v-field-border-opacity: 0.3;
}
</style>
