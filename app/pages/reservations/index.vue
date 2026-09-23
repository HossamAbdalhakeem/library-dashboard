<template>
  <ReservationsPageIndex />
</template>

<script setup>
import ReservationsPageIndex from "~/components/dashboard/pages/reservations/ReservationsPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
