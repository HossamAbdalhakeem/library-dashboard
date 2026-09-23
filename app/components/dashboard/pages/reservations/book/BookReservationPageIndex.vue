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
import BookingForm from "./components/form/BookingForm.vue";
import { reservationApi } from "~/services/reservation";
import { useAuth } from "~/composables/useAuth";

defineProps({
  title: { type: String, default: "حجز الكتب" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  initialSelection: { type: Object, default: null },
});

defineEmits(["hydrating"]);

const { isCustomerService } = useAuth();

const cardPt = computed(() =>
  isCustomerService.value
    ? {
        root: { class: "border border-white/10 bg-slate-900 text-slate-100" },
        body: { class: "p-4 md:p-6" },
      }
    : undefined,
);

const submitReservation = async (payload) => {
  return await reservationApi.createReservation(payload);
};
</script>
