<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
/** Login stays dark-branded regardless of dashboard theme preference. */
const { initTheme } = useTheme();

onMounted(() => {
  if (import.meta.client) {
    document.documentElement.classList.add("app-dark");
  }
});

onBeforeUnmount(() => {
  initTheme();
});
</script>
