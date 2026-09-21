<template>
  <div class="space-y-6">
    <Card :pt="cardPt">
      <template #content>
        <BookingForm
          :title="title"
          :submit-label="submitLabel"
          :show-header="showHeader"
          :back-to="backTo"
          :initial-product="initialProduct"
          :initial-selection="initialSelection"
          :role="bookingRole"
          :submit-fn="submitReservation"
          @hydrating="$emit('hydrating', $event)"
        >
          <template v-if="$slots['header-actions']" #header-actions>
            <slot name="header-actions" />
          </template>
        </BookingForm>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import BookingForm from "~/components/dashboard/BookingForm.vue";
import { reservationService } from "~/services/reservationService";
import { useBookingRole } from "~/composables/useBookingRole";

defineProps({
  title: { type: String, default: "حجز الكتب" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  initialSelection: { type: Object, default: null },
});

defineEmits(["hydrating"]);

const { bookingRole, isCustomerService } = useBookingRole();

const cardPt = computed(() =>
  isCustomerService.value
    ? {
        root: { class: "border border-white/10 bg-slate-900 text-slate-100" },
        body: { class: "p-4 md:p-6" },
      }
    : undefined,
);

const submitReservation = async (payload) => {
  return await reservationService.createReservation(payload);
};
</script>
