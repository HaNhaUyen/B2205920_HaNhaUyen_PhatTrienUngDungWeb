<template>
  <div
    class="min-h-screen flex justify-center items-center bg-gray-50 py-12 px-2 sm:px-6 lg:px-8"
  >
    <v-card
      class="w-full max-w-3xl rounded-xl shadow-lg bg-white overflow-hidden"
      elevation="0"
    >
      <v-row no-gutters>
        <!-- Phần Header -->
        <v-col cols="12" class="bg-black text-white p-6 text-center">
          <div class="d-flex flex-column align-center justify-center">
            <v-avatar color="white" size="64" class="mb-3">
              <v-icon size="32" color="black">mdi-account-plus</v-icon>
            </v-avatar>
            <h2 class="text-3xl font-bold uppercase tracking-wide">
              Đăng ký tài khoản
            </h2>
            <p class="text-gray-300 mt-2 text-sm">
              Tham gia cùng chúng tôi ngay hôm nay
            </p>
          </div>
        </v-col>

        <!-- Phần Form -->
        <v-col cols="12" class="p-4 sm:p-8">
          <v-alert
            v-if="serverError"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="serverError = ''"
          >
            {{ serverError }}
          </v-alert>

          <Form @submit="submitRegister" :validation-schema="schema">
            <!-- Thêm mt-5 ở đây để tạo khoảng cách với tiêu đề -->
            <v-row dense class="mt-5">
              <!-- Nhóm thông tin cá nhân: Luôn hiển thị 2 cột (cols="6") -->
              <v-col cols="6">
                <Field name="name" v-slot="{ field, errors }">
                  <v-text-field
                    v-bind="field"
                    label="Họ và tên"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1 mr-1"
                  />
                  <!-- mr-1 để tạo chút khoảng cách giữa 2 ô trên mobile -->
                </Field>
              </v-col>

              <v-col cols="6">
                <Field name="so_dien_thoai" v-slot="{ field, errors }">
                  <v-text-field
                    v-bind="field"
                    label="Số điện thoại"
                    prepend-inner-icon="mdi-phone-outline"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1 ml-1"
                  />
                </Field>
              </v-col>

              <!-- Nhóm giới tính và ngày sinh: Luôn hiển thị 2 cột -->
              <v-col cols="6">
                <Field name="phai" v-slot="{ field, errors }">
                  <v-select
                    v-bind="field"
                    :items="['Nam', 'Nữ']"
                    label="Giới tính"
                    prepend-inner-icon="mdi-gender-male-female"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1 mr-1"
                  />
                </Field>
              </v-col>

              <v-col cols="6">
                <Field name="ngaysinh" v-slot="{ field, errors }">
                  <v-text-field
                    v-bind="field"
                    label="Ngày sinh"
                    type="date"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1 ml-1"
                  />
                </Field>
              </v-col>

              <!-- Địa chỉ (Full width) -->
              <v-col cols="12">
                <Field name="dia_chi" v-slot="{ field, errors }">
                  <v-text-field
                    v-bind="field"
                    label="Địa chỉ liên hệ"
                    prepend-inner-icon="mdi-map-marker-outline"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1"
                  />
                </Field>
              </v-col>

              <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

              <!-- Nhóm tài khoản -->
              <v-col cols="12">
                <Field name="email" v-slot="{ field, errors }">
                  <v-text-field
                    v-bind="field"
                    label="Email đăng nhập"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1"
                  />
                </Field>
              </v-col>

              <!-- Mật khẩu: Luôn hiển thị 2 cột -->
              <v-col cols="6">
                <Field name="password" v-slot="{ field, errors }">
                  <v-text-field
                    v-bind="field"
                    :type="showPassword ? 'text' : 'password'"
                    label="Mật khẩu"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1 mr-1"
                  />
                </Field>
              </v-col>

              <v-col cols="6">
                <Field name="confirmPassword" v-slot="{ field, errors }">
                  <v-text-field
                    v-bind="field"
                    :type="showPassword ? 'text' : 'password'"
                    label="Nhập lại MK"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :append-inner-icon="
                      showPassword ? 'mdi-eye-off' : 'mdi-eye'
                    "
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    density="comfortable"
                    color="black"
                    :error-messages="errors"
                    class="mb-1 ml-1"
                  />
                </Field>
              </v-col>
            </v-row>

            <div class="mt-6">
              <v-btn
                type="submit"
                color="black"
                class="text-white text-uppercase font-weight-bold"
                block
                size="large"
                elevation="2"
              >
                Đăng ký ngay
              </v-btn>
            </div>
          </Form>

          <div class="text-center mt-6">
            <p class="text-sm text-gray-600">
              Bạn đã có tài khoản?
              <router-link
                to="/login"
                class="font-bold text-black hover:text-gray-700 transition-colors"
              >
                Đăng nhập tại đây
              </router-link>
            </p>
          </div>
        </v-col>
      </v-row>
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
      showPassword: false,
      serverError: "",
      schema: yup.object({
        name: yup.string().required("Họ và tên không được để trống"),
        email: yup
          .string()
          .email("Email không hợp lệ")
          .required("Email không được để trống"),
        password: yup
          .string()
          .min(6, "Mật khẩu phải ít nhất 6 ký tự")
          .required("Mật khẩu không được để trống"),
        confirmPassword: yup
          .string()
          .oneOf([yup.ref("password")], "Mật khẩu không khớp")
          .required("Vui lòng nhập lại"),
        phai: yup.string().required("Vui lòng chọn"),
        ngaysinh: yup.date().required("Vui lòng chọn"),
        so_dien_thoai: yup
          .string()
          .matches(/^[0-9]+$/, "Chỉ nhập số")
          .min(10, "Ít nhất 10 số")
          .required("Nhập SĐT"),
        dia_chi: yup.string().required("Vui lòng nhập địa chỉ"),
      }),
    };
  },
  methods: {
    async submitRegister(values) {
      try {
        await api.post("/api/users/register", {
          ho_ten: values.name,
          email: values.email,
          mat_khau: values.password,
          phai: values.phai,
          ngaysinh: values.ngaysinh,
          so_dien_thoai: values.so_dien_thoai,
          dia_chi: values.dia_chi,
        });
        alert("Đăng ký thành công!");
        this.$router.push("/login");
      } catch (error) {
        this.serverError = error.response?.data?.message || error.message;
      }
    },
  },
};
</script>

<style scoped>
/* Giảm độ mờ của viền input để nhìn thanh thoát hơn */
.v-field--variant-outlined .v-field__outline {
  --v-field-border-opacity: 0.3;
}
</style>
