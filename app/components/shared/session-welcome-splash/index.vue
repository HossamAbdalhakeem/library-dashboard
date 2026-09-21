<template>
  <div
    class="session-splash fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
    dir="rtl"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="session-splash__glow" aria-hidden="true" />
    <div class="session-splash__grid" aria-hidden="true" />

    <div class="relative z-10 flex max-w-lg flex-col items-center px-6 text-center">
      <div class="session-splash__mark" aria-hidden="true">▦</div>

      <p class="session-splash__eyebrow">لوحة التحكم</p>

      <h1 class="session-splash__title">
        جاري تحميل لوحة التحكم
      </h1>

      <p class="session-splash__subtitle">
        لحظات ونرجعك للمكتبة…
      </p>

      <div class="session-splash__bar" aria-hidden="true">
        <span class="session-splash__bar-fill" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "SessionWelcomeSplash" });
</script>

<style scoped>
.session-splash__glow {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(
      ellipse 50% 40% at 50% 35%,
      rgba(245, 175, 82, 0.18),
      transparent 70%
    ),
    radial-gradient(
      ellipse 40% 35% at 70% 70%,
      rgba(245, 175, 82, 0.06),
      transparent 70%
    );
  animation: splash-glow 4.5s ease-in-out infinite alternate;
}

.session-splash__grid {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 60% 55% at 50% 45%, #000 20%, transparent 75%);
}

.session-splash__mark {
  display: flex;
  height: 3.5rem;
  width: 3.5rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.75rem;
  border-radius: 1rem;
  border: 1px solid rgba(245, 175, 82, 0.3);
  background: rgba(245, 175, 82, 0.12);
  color: #fcefd9;
  font-size: 1.5rem;
  box-shadow: 0 0 40px -12px rgba(245, 175, 82, 0.55);
  animation: splash-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.session-splash__eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  color: rgba(252, 239, 217, 0.75);
  animation: splash-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
}

.session-splash__title {
  margin: 0;
  max-width: 18rem;
  font-size: clamp(1.6rem, 4vw, 2.15rem);
  font-weight: 700;
  line-height: 1.35;
  color: #ffffff;
  animation: splash-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both;
}

.session-splash__subtitle {
  margin: 1rem 0 0;
  font-size: 0.875rem;
  color: #a3a3a3;
  animation: splash-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.26s both;
}

.session-splash__bar {
  position: relative;
  margin-top: 2rem;
  height: 2px;
  width: 8rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  animation: splash-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.36s both;
}

.session-splash__bar-fill {
  position: absolute;
  inset: 0;
  width: 40%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent,
    #f5af52,
    transparent
  );
  animation: splash-bar 1.4s ease-in-out infinite;
}

@keyframes splash-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes splash-glow {
  from {
    opacity: 0.75;
    transform: scale(1);
  }
  to {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes splash-bar {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(320%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .session-splash__glow,
  .session-splash__mark,
  .session-splash__eyebrow,
  .session-splash__title,
  .session-splash__subtitle,
  .session-splash__bar,
  .session-splash__bar-fill {
    animation: none;
  }
}
</style>
