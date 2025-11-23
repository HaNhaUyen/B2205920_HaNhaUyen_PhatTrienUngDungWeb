<template>
  <div class="h-[80vh] flex justify-center items-center bg-white mt-10">
    <v-card
      class="w-full max-w-md mx-auto p-8 rounded-2xl shadow-md border border-gray-200 bg-white"
      elevation="2"
    >
      <div class="text-center mb-6 mt-4">
        <v-icon size="48" class="text-black mb-2">mdi-login</v-icon>
        <h2 class="text-2xl font-bold text-black">Đăng nhập người dùng</h2>

        <v-alert v-if="serverError" type="error" dense text>
          {{ serverError }}
        </v-alert>
      </div>

      <Form
        @submit="submitLogin"
        :validation-schema="schema"
        class="space-y-5 px-6 pb-6"
      >
        <Field name="email" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            label="Email"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
          />
        </Field>

        <Field name="password" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            :type="showPassword ? 'text' : 'password'"
            label="Mật khẩu"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
          />
        </Field>

        <v-btn
          type="submit"
          class="bg-black text-white w-full py-3 rounded-md text-base"
        >
          Đăng nhập
        </v-btn>
      </Form>

      <p class="text-sm text-gray-600 text-center pb-6 mt-4">
        Bạn chưa có tài khoản?
        <router-link to="/register" class="text-black hover:underline"
          >Đăng ký</router-link
        >
      </p>
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
        email: yup
          .string()
          .required("Email không được để trống")
          .email("Email không hợp lệ"),
        password: yup
          .string()
          .required("Mật khẩu không được để trống")
          .min(6, "Mật khẩu ít nhất 6 ký tự"),
      }),
    };
  },

  methods: {
    async submitLogin(values) {
      try {
        const res = await api.post("/api/users/login", values);
        const { token, user } = res.data;

        if (user.role === "admin") {
          this.serverError =
            "Tài khoản admin không thể đăng nhập ở trang người dùng";
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        this.$router.push("/");
        alert("Đăng nhập thành công!");
      } catch (error) {
        this.serverError =
          error.response?.data?.message || "Sai tài khoản hoặc mật khẩu";
        setTimeout(() => (this.serverError = ""), 3000);
      }
    },
  },
};
</script>
