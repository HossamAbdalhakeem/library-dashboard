<template>
  <span class="inline-flex">
    <button
      type="button"
      class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-slate-800 text-slate-300 transition hover:border-primary-400/50 hover:text-primary-300 hover:ring-2 hover:ring-primary-400/30 disabled:opacity-60"
      title="عرض الصورة"
      :disabled="loading"
      @click.stop="openPreview"
    >
      <i :class="['pi text-sm', loading ? 'pi-spin pi-spinner' : 'pi-camera']" />
    </button>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      dir="rtl"
      :header="title"
      :style="{ width: '380px', maxWidth: '92vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <div class="flex min-h-40 w-full flex-col items-center justify-center gap-3">
        <template v-if="loading && !resolvedUrl">
          <Skeleton width="100%" height="10rem" border-radius="12px" />
        </template>
        <img
          v-else-if="resolvedUrl"
          :src="resolvedUrl"
          :alt="title"
          class="max-h-64 w-full rounded-xl object-contain"
        >
        <p v-else class="text-sm text-rose-400">
          {{ errorMessage || "تعذر عرض الصورة." }}
        </p>
      </div>
    </Dialog>
  </span>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Skeleton from "primevue/skeleton";
import { attendanceApi } from "~/services/attendance";

defineOptions({ name: "AttendancePhotoButton" });

const props = defineProps({
  attendanceId: { type: String, required: true },
  title: { type: String, default: "صورة الحضور" },
});

const loading = ref(false);
const dialogVisible = ref(false);
const resolvedUrl = ref("");
const errorMessage = ref("");
const fetchedId = ref("");

const openPreview = async () => {
  dialogVisible.value = true;
  if (resolvedUrl.value && fetchedId.value === props.attendanceId) return;

  loading.value = true;
  errorMessage.value = "";
  resolvedUrl.value = "";
  try {
    const result = await attendanceApi.getPhoto(props.attendanceId);
    resolvedUrl.value = result?.fileUrl || "";
    fetchedId.value = props.attendanceId;
    if (!resolvedUrl.value) errorMessage.value = "لا توجد صورة.";
  } catch (error) {
    errorMessage.value = error?.message || "تعذر تحميل الصورة.";
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.attendanceId,
  () => {
    resolvedUrl.value = "";
    fetchedId.value = "";
    errorMessage.value = "";
  },
);
</script>
