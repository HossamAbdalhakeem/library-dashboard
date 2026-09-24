<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :closable="false"
    :dismissable-mask="false"
    :close-on-escape="false"
    :style="{ width: '440px', maxWidth: '95vw' }"
    :pt="{
      header: { class: 'hidden' },
      content: { class: 'pt-6' },
    }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="summary" class="flex flex-col items-center text-center">
      <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
        ✓
      </div>
      <p class="text-base font-bold text-slate-900">تم تسجيل الحجز بنجاح</p>

      <div class="mt-5 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs text-slate-500">رقم الحجز</span>
          <span class="text-xl font-extrabold tracking-wide text-emerald-700 break-all">
            {{ summary.reservationNumber }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <span class="text-xs text-slate-500">التاريخ والوقت</span>
          <span class="text-sm font-medium text-slate-800">
            {{ summary.dateTimeLabel }}
          </span>
        </div>

        <div class="flex items-start justify-between gap-3 border-t border-slate-200 pt-3">
          <span class="text-xs text-slate-500">المنتج</span>
          <div class="text-sm font-semibold text-slate-900">
            <p>{{ summary.productName }}</p>
            <p v-if="summary.teacherName" class="mt-0.5 text-xs font-normal text-slate-500">
              مقدم من أ/ {{ summary.teacherName }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <span class="text-xs text-slate-500">السنة الدراسية</span>
          <span class="text-sm font-medium text-slate-800">
            {{ summary.studyYearName || "-" }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <span class="text-xs text-slate-500">الطالب</span>
          <span class="text-sm font-medium text-slate-800">
            {{ summary.studentName }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <span class="text-xs text-slate-500">المبلغ المدفوع</span>
          <span class="text-sm font-medium text-slate-800">
            {{ formatMoney(summary.paidAmount) }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <span class="text-xs text-slate-500">طريقة الدفع</span>
          <span class="text-sm font-medium text-slate-800">
            {{ summary.methodLabel }}
          </span>
        </div>

        <div
          v-if="summary.proofImage"
          class="border-t border-slate-200 pt-3"
        >
          <p class="mb-2 text-xs text-slate-500">صورة إثبات الدفع</p>
          <img
            :src="summary.proofImage"
            alt="إثبات الدفع"
            class="mx-auto max-h-48 w-auto max-w-full rounded-xl border border-slate-200 object-contain"
          />
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-emerald-200 pt-3">
          <span class="text-sm font-semibold text-emerald-700">إجمالي السعر</span>
          <span class="text-lg font-extrabold text-emerald-700">
            {{ formatMoney(summary.totalAmount) }}
          </span>
        </div>
      </div>

      <p class="mt-3 text-xs text-slate-500">احتفظ برقم الحجز لتسليم الكتاب لاحقًا</p>
    </div>

    <template #footer>
      <div class="flex w-full justify-center">
        <Button
          label="إغلاق"
          severity="secondary"
          class="min-w-[120px]"
          @click="onClose"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { formatMoney } from "~/utils/format/money";

defineOptions({ name: "ReservationSuccessDialog" });

defineProps({
  visible: { type: Boolean, default: false },
  summary: { type: Object, default: null },
});

const emit = defineEmits(["update:visible", "close"]);

const onClose = () => {
  emit("update:visible", false);
  emit("close");
};
</script>
