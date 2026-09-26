<template>
  <section
    class="flex items-center justify-center bg-[#111111] p-6 sm:p-8 lg:p-12"
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-right">
        <p class="text-xs font-semibold tracking-[0.22em] text-neutral-400">
          تسجيل الدخول
        </p>
        <h2 class="mt-3 text-3xl font-bold text-white">مرحباً بعودتك</h2>
      </div>

      <Form
        v-slot="{ errors: fieldErrors, meta }"
        class="space-y-6"
        :initial-values="initialValues"
        @submit="submitLogin"
      >
        <Field v-slot="{ field, errorMessage }" name="email" rules="required|email">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-neutral-300"
              >البريد الإلكتروني</label
            >
            <InputText
              v-bind="field"
              v-model="form.email"
              type="email"
              placeholder="admin@library.local"
              class="w-full"
              data-testid="login-email"
              :class="{ 'p-invalid': errorMessage || fieldErrors.email }"
            />
            <ErrorMessage name="email" class="text-xs text-red-400" />
          </div>
        </Field>

        <Field
          v-slot="{ field, errorMessage }"
          name="password"
          rules="required|min:6"
        >
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-neutral-300"
              >كلمة المرور</label
            >
            <Password
              v-bind="field"
              v-model="form.password"
              toggle-mask
              :feedback="false"
              placeholder="••••••••"
              class="w-full"
              input-id="login-password"
              :pt="{
                pcInputText: {
                  root: { 'data-testid': 'login-password' },
                },
              }"
              :input-class="[
                'w-full',
                { 'p-invalid': errorMessage || fieldErrors.password },
              ]"
            />
            <ErrorMessage name="password" class="text-xs text-red-400" />
          </div>
        </Field>

        <FormSubmitButton
          data-testid="login-submit"
          :loading="authStore.loading"
          :valid="meta.valid"
          severity="primary"
          size="large"
          button-class="w-full justify-center"
        >
          {{
            authStore.loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"
          }}
        </FormSubmitButton>
      </Form>

      <div
        class="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 text-right text-sm text-neutral-400"
      >
        <p class="font-semibold text-white">بيانات تجريبية:</p>
        <ul class="mt-2 space-y-2">
          <li>مدير: admin@library.local</li>
          <li>خدمة العملاء: cs1@library.local  /cs2@library.local </li>
          <li>
            موظف فرع: employee1@library.local  /
            employee2@library.local 
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import { useAuthStore } from "~/store/auth.js";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "LoginLeftSide" });

const authStore = useAuthStore();
const { showError } = useAppToast();
const rememberMe = ref(false);
const form = reactive({
  email: "",
  password: "",
});

const initialValues = {
  email: "",
  password: "",
};

const submitLogin = async () => {
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: rememberMe.value,
    });
  } catch (error) {
    showError(error?.message || "تعذر تسجيل الدخول.");
  }
};
</script>
