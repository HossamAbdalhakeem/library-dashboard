<template>
  <div
    class="flex min-h-screen items-center justify-center bg-black px-4 py-8 sm:px-6 lg:px-8"
    dir="rtl"
  >
    <div
      class="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
    >
      <div
        class="grid min-h-[min(760px,calc(100vh-4rem))] lg:grid-cols-[1.05fr_0.95fr]"
      >
        <LoginRightSide />
        <LoginLeftSide />
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginRightSide from "~/components/login/components/LoginRightSide.vue";
import LoginLeftSide from "~/components/login/components/LoginLeftSide.vue";

defineOptions({ name: "LoginPageIndex" });
</script>
