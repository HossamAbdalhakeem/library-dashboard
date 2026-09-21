<template>
  <DeliverReservationPage />
</template>

<script setup>
import DeliverReservationPage from "~/components/dashboard/pages/reservations/deliver/DeliverReservationPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
