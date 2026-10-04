<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="تفاصيل الحضور"
    :style="{ width: '720px', maxWidth: '92vw' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="loading" class="grid gap-3">
      <Skeleton width="70%" height="1rem" />
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Skeleton width="100%" height="6rem" border-radius="12px" />
        <Skeleton width="100%" height="6rem" border-radius="12px" />
      </div>
    </div>

    <div v-else-if="day" class="space-y-4">
      <dl class="grid gap-2 text-sm">
        <div class="flex items-center justify-between gap-3">
          <dt class="text-[var(--app-muted)]">الموظف</dt>
          <dd class="font-medium text-[var(--app-text-strong)]">{{ day.employee.fullName }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-[var(--app-muted)]">الفرع</dt>
          <dd class="font-medium text-[var(--app-text-strong)]">{{ day.branch.name }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-[var(--app-muted)]">التاريخ</dt>
          <dd class="font-medium text-[var(--app-text-strong)]">{{ dateLabel }}</dd>
        </div>
      </dl>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AttendancePunchDetail title="الحضور" :punch="day.checkIn" />
        <AttendancePunchDetail title="الانصراف" :punch="day.checkOut" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Skeleton from "primevue/skeleton";
import { attendanceApi, formatWorkDateLabel } from "~/services/attendance";
import { useAppToast } from "~/composables/useAppToast";
import AttendancePunchDetail from "./AttendancePunchDetail.vue";

defineOptions({ name: "AttendanceDetailDialog" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  employeeId: { type: String, default: "" },
  workDate: { type: String, default: "" },
});

defineEmits(["update:visible"]);

const { showError } = useAppToast();
const loading = ref(false);
const day = ref(null);

const dateLabel = computed(() => formatWorkDateLabel(day.value?.workDate || props.workDate));

const load = async () => {
  if (!props.visible || !props.employeeId || !props.workDate) return;
  loading.value = true;
  day.value = null;
  try {
    day.value = await attendanceApi.getDay(props.employeeId, props.workDate);
  } catch (error) {
    showError(error?.message || "تعذر تحميل تفاصيل الحضور.");
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.visible, props.employeeId, props.workDate],
  () => {
    if (props.visible) load();
  },
);
</script>
