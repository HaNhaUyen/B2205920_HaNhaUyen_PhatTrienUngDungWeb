<template>
  <div class="flex justify-center items-center bg-white mt-10">
    <v-card
      class="w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-md border border-gray-200 bg-white"
      elevation="2"
    >
      <div class="text-center mb-6 mt-4">
        <v-icon size="48" class="text-black mb-2">mdi-account-edit</v-icon>
        <h2 class="text-2xl font-bold text-black">Chỉnh sửa người dùng</h2>
      </div>

      <Form
        v-if="initialValues"
        :key="formKey"
        @submit="submitForm"
        :initial-values="initialValues"
        :validation-schema="schema"
        class="space-y-5 px-6 pb-6"
      >
        <Field name="name" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            label="Họ tên"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
            :model-value="field.value"
            @update:model-value="field.value = $event"
          />
        </Field>

        <Field name="email" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            label="Email"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
            :model-value="field.value"
            @update:model-value="field.value = $event"
          />
        </Field>

        <Field name="phone" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            label="Số điện thoại"
            prepend-inner-icon="mdi-phone"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
            :model-value="field.value"
            @update:model-value="field.value = $event"
          />
        </Field>

        <Field name="address" v-slot="{ field, errors }">
          <v-text-field
            v-bind="field"
            label="Địa chỉ"
            prepend-inner-icon="mdi-map-marker"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
            :model-value="field.value"
            @update:model-value="field.value = $event"
          />
        </Field>

        <Field name="status" v-slot="{ field, errors }">
          <v-select
            v-bind="field"
            :items="['Hoạt động', 'Khóa']"
            label="Trạng thái"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
            :model-value="field.value"
            @update:model-value="field.value = $event"
          />
        </Field>

        <Field name="role" v-slot="{ field, errors }">
          <v-select
            v-bind="field"
            :items="['Độc giả', 'admin']"
            label="Vai trò"
            variant="outlined"
            color="black"
            :error-messages="errors"
            class="mb-2"
            :model-value="field.value"
            @update:model-value="field.value = $event"
          />
        </Field>

        <div class="flex space-x-3">
          <v-btn
            type="button"
            class="bg-black text-white w-1/2 py-3 rounded-md text-base"
            depressed
            @click="cancelEdit"
          >
            Hủy
          </v-btn>

          <v-btn
            type="submit"
            class="bg-black text-white w-1/2 py-3 rounded-md text-base"
            depressed
          >
            Cập nhật
          </v-btn>
        </div>
      </Form>
    </v-card>

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
      schema: yup.object({
        name: yup.string().required("Vui lòng nhập họ tên"),
        email: yup
          .string()
          .email("Email không hợp lệ")
          .required("Vui lòng nhập email"),
        phone: yup.string().required("Vui lòng nhập số điện thoại"),
        address: yup.string().required("Vui lòng nhập địa chỉ"),
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
      try {
        const response = await api.get(`/api/users/${id}`);
        const user = response.data;
        this.initialValues = {
          name: user.ho_ten || "",
          email: user.email || "",
          phone: user.so_dien_thoai || "",
          address: user.dia_chi || "",
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
          trang_thai: values.status === "Khóa" ? "inactive" : "active",
          vai_tro: values.role === "admin" ? "admin" : "reader",
        };
        await api.put(`/api/users/${id}`, payload);
        this.showMessage("Cập nhật người dùng thành công!", "success");

        // Delay 1s rồi quay về danh sách người dùng
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
/* Thêm CSS tùy chỉnh nếu cần */
</style>
