<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="تصدير الطلاب"
    :style="{ width: 'min(560px, 96vw)' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    @update:visible="$emit('update:visible', $event)"
    @hide="onHide"
  >
    <div class="flex flex-col gap-4">
      <AppGlobalSelectStudyYear
        v-model="filters.studyYearId"
        label="السنة الدراسية"
        placeholder="كل السنوات"
        show-clear
      />

      <AppDateRangePicker
        v-model:from="filters.from"
        v-model:to="filters.to"
        label="من / إلى"
        placeholder="اختر الفترة"
      />

      <AppGlobalSelectStudent
        v-model="filters.student"
        label="الطالب"
        placeholder="كل الطلاب"
        :show-add-button="false"
      />
    </div>

    <template #footer>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <Button
          label="إلغاء"
          severity="secondary"
          text
          :disabled="exporting"
          @click="$emit('update:visible', false)"
        />
        <Button
          label="تصدير"
          icon="pi pi-download"
          severity="primary"
          :loading="exporting"
          data-testid="students-export-confirm"
          @click="onExport"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import AppDateRangePicker from "~/components/shared/reports/app-date-range-picker/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import AppGlobalSelectStudent from "~/components/shared/selections/app-global-select-student/index.vue";
import { useStudentExport } from "../../composables/useStudentExport";

defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "hide"]);

const { exporting, filters, resetFilters, exportStudents } = useStudentExport();

const onHide = () => {
  resetFilters();
  emit("hide");
};

const onExport = async () => {
  const ok = await exportStudents();
  if (ok) {
    emit("update:visible", false);
  }
};
</script>
