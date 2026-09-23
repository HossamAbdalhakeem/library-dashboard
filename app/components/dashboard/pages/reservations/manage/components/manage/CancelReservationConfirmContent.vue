<template>
  <AppConfirmContent
    warning="لا يمكن التراجع عن هذا الإجراء بعد التأكيد."
    :details="confirmDetails"
  >
    <template #message>
      <p>
        هل أنت متأكد من إلغاء الحجز
        <span class="font-bold text-slate-900">
          {{ reservation?.reservationNumber }}
        </span>
        ؟
      </p>
    </template>
  </AppConfirmContent>
</template>

<script setup>
import AppConfirmContent from "~/components/shared/app-confirm-content/index.vue";

const props = defineProps({
  reservation: { type: Object, default: null },
});

const confirmDetails = computed(() => {
  if (!(Number(props.reservation?.payment?.paidAmount) > 0)) return [];
  return [
    {
      key: "refund",
      label: "الاسترداد",
      value: props.reservation?.payment?.paidAmountLabel,
      valueClass: "font-semibold text-emerald-700",
    },
  ];
});
</script>
