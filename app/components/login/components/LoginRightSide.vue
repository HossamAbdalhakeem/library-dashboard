<template>
  <section
    class="relative flex flex-col justify-between overflow-hidden border-l border-white/10 bg-[radial-gradient(120%_80%_at_100%_0%,theme(colors.primary.500/28),transparent_55%),radial-gradient(90%_70%_at_0%_100%,theme(colors.primary.700/32),transparent_50%),linear-gradient(160deg,#050505_0%,#12100c_45%,#000_100%)] p-8 text-white sm:p-10 lg:p-12"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:48px_48px] opacity-[0.18] [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <span
        class="absolute -right-12 -top-16 size-64 rounded-full bg-primary-500/30 blur-[48px] animate-login-orb-float motion-reduce:animate-none"
      />
      <span
        class="absolute -left-16 bottom-[10%] size-72 rounded-full bg-primary-700/35 blur-[48px] animate-login-orb-float-slow motion-reduce:animate-none"
      />
      <span
        class="absolute right-[18%] top-[42%] size-36 rounded-full bg-white/10 blur-[48px] animate-login-orb-float-delayed motion-reduce:animate-none"
      />
    </div>

    <div class="relative z-10">
      <div
        class="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-400/30 bg-primary-500/15 text-2xl text-primary-100 shadow-[0_0_40px_-12px_theme(colors.primary.500/55)] backdrop-blur-sm"
        aria-hidden="true"
      >
        ▦
      </div>
      <p
        class="mb-3 text-xs font-semibold tracking-[0.25em] text-primary-200/80"
      >
        لوحة التحكم
      </p>
      <h1 class="max-w-md text-4xl font-bold leading-tight sm:text-5xl">
        نظام إدارة المكتبة
      </h1>
      <p class="mt-4 max-w-sm text-sm leading-relaxed text-neutral-300">
        منصة موحّدة لإدارة الفروع والمنتجات والمبيعات والحجوزات والمخزون
        والتقارير.
      </p>
    </div>

    <div class="relative z-10 space-y-6 text-right">
      <div
        class="rounded-2xl border border-white/10 bg-black/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
      >
        <p class="text-sm text-primary-100/80">إدارة فروع المكتبة</p>
        <p class="mt-2 text-xl font-bold leading-snug text-white">
          متابعة العمليات يومياً من مكان واحد
        </p>
      </div>

      <ul class="space-y-3 text-sm text-neutral-300">
        <li class="flex items-center gap-3">
          <span
            class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-400 shadow-[0_0_12px_theme(colors.primary.400/70)]"
          />
          إدارة المبيعات والحجوزات
        </li>
        <li class="flex items-center gap-3">
          <span
            class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-400 shadow-[0_0_12px_theme(colors.primary.400/70)]"
          />
          متابعة المخزون والمنتجات
        </li>
        <li class="flex items-center gap-3">
          <span
            class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-400 shadow-[0_0_12px_theme(colors.primary.400/70)]"
          />
          تقارير مالية وملفات الطلبة
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: "LoginRightSide" });
</script>
