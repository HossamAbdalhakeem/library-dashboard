<template>
  <ReservationsPage />
</template>

<script setup>
import ReservationsPage from "~/components/dashboard/pages/reservations/ReservationsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
