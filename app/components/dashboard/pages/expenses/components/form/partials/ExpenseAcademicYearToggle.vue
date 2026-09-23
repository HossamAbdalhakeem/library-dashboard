<template>
  <div
    class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"
  >
    <div class="text-right">
      <p class="text-sm font-medium text-slate-800">
        مصروف مرتبط بالفترة الحالية
      </p>
      <p class="text-xs text-slate-500">
        {{
          linkToAcademicYear
            ? "يُحسب ضمن تقرير الأرباح"
            : "مصروف عام — لا يُخصم من صافي الربح تلقائياً"
        }}
      </p>
    </div>
    <ToggleSwitch
      :model-value="linkToAcademicYear"
      @update:model-value="$emit('update:linkToAcademicYear', $event)"
    />
  </div>
</template>

<script setup>
import ToggleSwitch from "primevue/toggleswitch";

defineOptions({ name: "ExpenseAcademicYearToggle" });

defineProps({
  linkToAcademicYear: { type: Boolean, default: false },
});

defineEmits(["update:linkToAcademicYear"]);
</script>
