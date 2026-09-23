<template>
  <ReservationsManagePageIndex />
</template>

<script setup>
import ReservationsManagePageIndex from "~/components/dashboard/pages/reservations/manage/ReservationsManagePageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
