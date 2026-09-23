<template>
  <div
    class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"
  >
    <div class="text-right">
      <p class="text-sm font-medium text-slate-800">حالة المستخدم</p>
      <p class="text-xs text-slate-500">
        {{ isActive ? "نشط" : "غير نشط" }}
      </p>
    </div>
    <ToggleSwitch
      :model-value="isActive"
      @update:model-value="$emit('update:isActive', $event)"
    />
  </div>
</template>

<script setup>
import ToggleSwitch from "primevue/toggleswitch";

defineOptions({ name: "UserActiveToggle" });

defineProps({
  isActive: { type: Boolean, default: true },
});

defineEmits(["update:isActive"]);
</script>
