<template>
  <section
    class="relative flex flex-col justify-between overflow-hidden border-l border-[var(--app-border)] bg-[radial-gradient(120%_80%_at_100%_0%,theme(colors.primary.500/22),transparent_55%),radial-gradient(90%_70%_at_0%_100%,theme(colors.primary.600/16),transparent_50%),linear-gradient(160deg,#fff8f0_0%,#faf6f1_45%,#f4f4f5_100%)] p-8 text-[var(--app-text-strong)] sm:p-10 lg:p-12 dark:border-white/10 dark:bg-[radial-gradient(120%_80%_at_100%_0%,theme(colors.primary.500/28),transparent_55%),radial-gradient(90%_70%_at_0%_100%,theme(colors.primary.700/32),transparent_50%),linear-gradient(160deg,#050505_0%,#12100c_45%,#000_100%)] dark:text-white"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(245,175,82,0.06)_50%,transparent_60%)] dark:bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(245,175,82,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(245,175,82,0.12)_1px,transparent_1px)] bg-[length:48px_48px] opacity-[0.35] [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)] dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-[0.18]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <span
        class="absolute -right-12 -top-16 size-64 rounded-full bg-primary-500/25 blur-[48px] animate-login-orb-float motion-reduce:animate-none dark:bg-primary-500/30"
      />
      <span
        class="absolute -left-16 bottom-[10%] size-72 rounded-full bg-primary-400/20 blur-[48px] animate-login-orb-float-slow motion-reduce:animate-none dark:bg-primary-700/35"
      />
      <span
        class="absolute right-[18%] top-[42%] size-36 rounded-full bg-primary-300/25 blur-[48px] animate-login-orb-float-delayed motion-reduce:animate-none dark:bg-white/10"
      />
    </div>

    <div class="relative z-10">
      <div
        class="mb-8 inline-flex rounded-2xl border border-[var(--app-border)] bg-white p-3 shadow-[0_0_40px_-12px_theme(colors.primary.500/40)] dark:border-transparent dark:shadow-[0_0_40px_-12px_theme(colors.primary.500/55)]"
      >
        <img
          src="/library-logo.jpeg"
          alt="بكالوريا وثانوية أونلاين"
          class="h-24 w-auto object-contain sm:h-28"
          width="112"
          height="112"
        />
      </div>
      <p
        class="mb-3 text-xs font-semibold tracking-[0.25em] text-primary-700/80 dark:text-primary-200/80"
      >
        لوحة التحكم
      </p>
      <h1 class="max-w-md text-4xl font-bold leading-tight sm:text-5xl">
        نظام إدارة المكتبة
      </h1>
      <p
        class="mt-4 max-w-sm text-sm leading-relaxed text-[var(--app-muted)] dark:text-neutral-300"
      >
        منصة موحّدة لإدارة الفروع والمنتجات والمبيعات والحجوزات والمخزون
        والتقارير.
      </p>
    </div>

    <div class="relative z-10 space-y-6 text-right">
      <div
        class="rounded-2xl border border-primary-500/25 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md dark:border-white/10 dark:bg-black/35 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <p class="text-sm text-primary-700/90 dark:text-primary-100/80">
          إدارة فروع المكتبة
        </p>
        <p
          class="mt-2 text-xl font-bold leading-snug text-[var(--app-text-strong)] dark:text-white"
        >
          متابعة العمليات يومياً من مكان واحد
        </p>
      </div>

      <ul
        class="space-y-3 text-sm text-[var(--app-muted-soft)] dark:text-neutral-300"
      >
        <li class="flex items-center gap-3">
          <span
            class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500 shadow-[0_0_12px_theme(colors.primary.400/50)] dark:bg-primary-400 dark:shadow-[0_0_12px_theme(colors.primary.400/70)]"
          />
          إدارة المبيعات والحجوزات
        </li>
        <li class="flex items-center gap-3">
          <span
            class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500 shadow-[0_0_12px_theme(colors.primary.400/50)] dark:bg-primary-400 dark:shadow-[0_0_12px_theme(colors.primary.400/70)]"
          />
          متابعة المخزون والمنتجات
        </li>
        <li class="flex items-center gap-3">
          <span
            class="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500 shadow-[0_0_12px_theme(colors.primary.400/50)] dark:bg-primary-400 dark:shadow-[0_0_12px_theme(colors.primary.400/70)]"
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
