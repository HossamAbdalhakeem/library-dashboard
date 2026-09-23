<template>
  <DeliverReservationPageIndex />
</template>

<script setup>
import DeliverReservationPageIndex from "~/components/dashboard/pages/reservations/deliver/DeliverReservationPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
