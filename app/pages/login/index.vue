<template>
  <div
    class="flex min-h-screen items-center justify-center bg-black px-4 py-8 sm:px-6 lg:px-8"
    dir="rtl"
  >
    <div class="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
      <div class="grid min-h-[min(760px,calc(100vh-4rem))] lg:grid-cols-[1.05fr_0.95fr]">
        <section class="login-brand relative flex flex-col justify-between overflow-hidden border-l border-white/10 p-8 text-white sm:p-10 lg:p-12">
          <div class="login-brand__glow" aria-hidden="true" />
          <div class="login-brand__grid" aria-hidden="true" />
          <div class="login-brand__orbs" aria-hidden="true">
            <span class="login-brand__orb login-brand__orb--one" />
            <span class="login-brand__orb login-brand__orb--two" />
            <span class="login-brand__orb login-brand__orb--three" />
          </div>

          <div class="relative z-10">
            <div
              class="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-400/30 bg-primary-500/15 text-2xl text-primary-100 shadow-[0_0_40px_-12px_rgba(245,175,82,0.55)] backdrop-blur-sm"
              aria-hidden="true"
            >
              ▦
            </div>
            <p class="mb-3 text-xs font-semibold tracking-[0.25em] text-primary-200/80">لوحة التحكم</p>
            <h1 class="max-w-md text-4xl font-bold leading-tight sm:text-5xl">نظام إدارة المكتبة</h1>
            <p class="mt-4 max-w-sm text-sm leading-relaxed text-neutral-300">
              منصة موحّدة لإدارة الفروع والمنتجات والمبيعات والحجوزات والمخزون والتقارير.
            </p>
          </div>

          <div class="relative z-10 space-y-6 text-right">
            <div class="rounded-2xl border border-white/10 bg-black/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <p class="text-sm text-primary-100/80">إدارة فروع المكتبة</p>
              <p class="mt-2 text-xl font-bold leading-snug text-white">متابعة العمليات يومياً من مكان واحد</p>
            </div>

            <ul class="space-y-3 text-sm text-neutral-300">
              <li class="flex items-center gap-3">
                <span class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-400 shadow-[0_0_12px_rgba(245,175,82,0.7)]" />
                إدارة المبيعات والحجوزات
              </li>
              <li class="flex items-center gap-3">
                <span class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-400 shadow-[0_0_12px_rgba(245,175,82,0.7)]" />
                متابعة المخزون والمنتجات
              </li>
              <li class="flex items-center gap-3">
                <span class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-400 shadow-[0_0_12px_rgba(245,175,82,0.7)]" />
                تقارير مالية وملفات الطلبة
              </li>
            </ul>
          </div>
        </section>

        <section class="flex items-center justify-center bg-[#111111] p-6 sm:p-8 lg:p-12">
          <div class="w-full max-w-md">
            <div class="mb-8 text-right">
              <p class="text-xs font-semibold tracking-[0.22em] text-neutral-400">تسجيل الدخول</p>
              <h2 class="mt-3 text-3xl font-bold text-white">مرحباً بعودتك</h2>
            </div>

            <Form v-slot="{ errors: fieldErrors, meta }" @submit="submitLogin" class="space-y-6" :initial-values="initialValues">
              <Field v-slot="{ field, errorMessage }" name="email" rules="required|email">
                <div class="flex flex-col gap-2 text-right">
                  <label class="text-sm font-medium text-neutral-300">البريد الإلكتروني</label>
                  <InputText
                    v-bind="field"
                    v-model="form.email"
                    type="email"
                    placeholder="admin@library.local"
                    class="w-full"
                    :class="{ 'p-invalid': errorMessage || fieldErrors.email }"
                  />
                  <ErrorMessage name="email" class="text-xs text-red-400" />
                </div>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="password" rules="required|min:6">
                <div class="flex flex-col gap-2 text-right">
                  <label class="text-sm font-medium text-neutral-300">كلمة المرور</label>
                  <Password
                    v-bind="field"
                    v-model="form.password"
                    toggle-mask
                    :feedback="false"
                    placeholder="••••••••"
                    class="w-full"
                    :input-class="['w-full', { 'p-invalid': errorMessage || fieldErrors.password }]"
                  />
                  <ErrorMessage name="password" class="text-xs text-red-400" />
                </div>
              </Field>
              <FormSubmitButton
                :loading="authStore.loading"
                :valid="meta.valid"
                severity="primary"
                size="large"
                button-class="w-full justify-center"
              >
                {{ authStore.loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول" }}
              </FormSubmitButton>
            </Form>

            <div class="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 text-right text-sm text-neutral-400">
              <p class="font-semibold text-white">بيانات تجريبية:</p>
              <ul class="mt-2 space-y-2">
                <li>مدير: admin@library.local </li>
                <!-- <li>خدمة العملاء: hossamabdalhakeem99+098@gmail.com /hossamabdalhakeem99+099@gmail.com</li> -->
                <!-- <li>موظف فرع: hossamabdalhakeem99+123@gmail.com  /  hossamabdalhakeem99+547@gmail.com</li> -->
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import { useAuthStore } from "~/store/auth.js";
import { useAppToast } from "~/composables/useAppToast";

const authStore = useAuthStore();
const { showError } = useAppToast();
const rememberMe = ref(false);
const form = reactive({
  email: "admin@library.local",
  password: "Password123!",
});

const initialValues = {
  email: "",
  password: "",
};

definePageMeta({
  middleware: ["local-auth-user"],
  layout: "login",
});

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

<style scoped>
.login-brand {
  background:
    radial-gradient(120% 80% at 100% 0%, rgba(245, 175, 82, 0.28), transparent 55%),
    radial-gradient(90% 70% at 0% 100%, rgba(188, 125, 44, 0.32), transparent 50%),
    linear-gradient(160deg, #050505 0%, #12100c 45%, #000000 100%);
}

.login-brand__glow {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.03) 50%, transparent 60%);
  pointer-events: none;
}

.login-brand__grid {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 70% 40%, black 20%, transparent 75%);
  pointer-events: none;
}

.login-brand__orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.login-brand__orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(48px);
}

.login-brand__orb--one {
  top: -4rem;
  right: -3rem;
  width: 16rem;
  height: 16rem;
  background: rgba(245, 175, 82, 0.32);
  animation: login-orb-float 10s ease-in-out infinite;
}

.login-brand__orb--two {
  bottom: 10%;
  left: -4rem;
  width: 18rem;
  height: 18rem;
  background: rgba(188, 125, 44, 0.35);
  animation: login-orb-float 12s ease-in-out infinite reverse;
}

.login-brand__orb--three {
  top: 42%;
  right: 18%;
  width: 9rem;
  height: 9rem;
  background: rgba(255, 255, 255, 0.08);
  animation: login-orb-float 8s ease-in-out infinite 1s;
}

@keyframes login-orb-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -18px, 0) scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-brand__orb {
    animation: none;
  }
}
</style>
