<template>
  <ReservationsManagePage />
</template>

<script setup>
import ReservationsManagePage from "~/components/dashboard/pages/reservations/ReservationsManagePage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
