<template>
  <ReservationsReportPageIndex />
</template>

<script setup>
import ReservationsReportPageIndex from "~/components/dashboard/pages/reservations/report/ReservationsReportPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
