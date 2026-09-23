<template>
  <div />
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";
import { homeForRole } from "~/utils/routeAccess";

const { isLoggedIn, role } = useAuth();

definePageMeta({
  middleware: ["local-pages"],
});

onMounted(async () => {
  if (!isLoggedIn.value) {
    await navigateTo("/login");
    return;
  }

  await navigateTo(homeForRole(role.value));
});
</script>
