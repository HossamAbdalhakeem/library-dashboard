<template>
  <section class="space-y-3 rounded-xl border border-slate-200 p-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm font-medium text-slate-800">موقع الفرع</p>
      <Button
        type="button"
        label="استخدام موقعي الحالي"
        icon="pi pi-map-marker"
        severity="secondary"
        size="small"
        :loading="locating"
        @click="useCurrentLocation"
      />
    </div>
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">رابط خرائط جوجل</label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <InputText
          v-model="mapsLink"
          class="w-full"
          dir="ltr"
          placeholder="https://maps.app.goo.gl/... أو رابط خرائط جوجل"
          @paste="onMapsPaste"
        />
        <Button
          type="button"
          label="استخراج الموقع"
          icon="pi pi-link"
          severity="secondary"
          class="shrink-0"
          :loading="extracting"
          @click="extractMapsLink()"
        />
      </div>
      <p class="text-xs text-slate-500">
        الصق رابط المكان، ويُملأ خط العرض وخط الطول تلقائياً.
      </p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">خط العرض</label>
        <AppInputNumber
          :model-value="latitude"
          :min="-90"
          :max="90"
          :max-fraction-digits="7"
          placeholder="اختياري"
          @update:model-value="$emit('update:latitude', $event)"
        />
      </div>
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">خط الطول</label>
        <AppInputNumber
          :model-value="longitude"
          :min="-180"
          :max="180"
          :max-fraction-digits="7"
          placeholder="اختياري"
          @update:model-value="$emit('update:longitude', $event)"
        />
      </div>
    </div>
    <Field
      v-slot="{ errorMessage }"
      :model-value="attendanceRadiusMeters"
      name="attendanceRadiusMeters"
      rules="required|min_value:10|max_value:5000"
      @update:model-value="$emit('update:attendanceRadiusMeters', $event)"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">نطاق الحضور (متر)</label>
        <AppInputNumber
          :model-value="attendanceRadiusMeters"
          :min="10"
          :max="5000"
          :max-fraction-digits="0"
          :invalid="Boolean(errorMessage || fieldErrors.attendanceRadiusMeters)"
          @update:model-value="$emit('update:attendanceRadiusMeters', $event)"
        />
        <ErrorMessage name="attendanceRadiusMeters" class="text-xs text-red-500" />
      </div>
    </Field>
  </section>
</template>

<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import { Field, ErrorMessage } from "vee-validate";
import { readDeviceLocation } from "~/utils/device-location";
import { branchApi } from "~/services/branch";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "BranchLocationFields" });

defineProps({
  latitude: { type: [Number, null], default: null },
  longitude: { type: [Number, null], default: null },
  attendanceRadiusMeters: { type: [Number, null], default: 100 },
  fieldErrors: { type: Object, default: () => ({}) },
});

const emit = defineEmits([
  "update:latitude",
  "update:longitude",
  "update:attendanceRadiusMeters",
]);

const { showError, showSuccess } = useAppToast();

const locating = ref(false);
const extracting = ref(false);
const mapsLink = ref("");

const useCurrentLocation = async () => {
  locating.value = true;
  try {
    const reading = await readDeviceLocation();
    if (reading.latitude == null || reading.longitude == null) {
      showError("تعذر قراءة الموقع. يمكنك إدخال الإحداثيات يدوياً.");
      return;
    }
    emit("update:latitude", reading.latitude);
    emit("update:longitude", reading.longitude);
  } finally {
    locating.value = false;
  }
};

const onMapsPaste = (event) => {
  const text = event.clipboardData?.getData("text")?.trim();
  if (!text) return;
  mapsLink.value = text;
  extractMapsLink(text);
};

const extractMapsLink = async (rawUrl) => {
  const url = (typeof rawUrl === "string" ? rawUrl : mapsLink.value).trim();
  if (!url) {
    showError("ألصق رابط خرائط جوجل أولاً.");
    return;
  }

  extracting.value = true;
  try {
    const location = await branchApi.resolveMapsLink(url);
    emit("update:latitude", location.latitude);
    emit("update:longitude", location.longitude);
    showSuccess("تم استخراج خط العرض وخط الطول من الرابط.");
  } catch (error) {
    showError(error?.message || "تعذر استخراج الموقع من الرابط.");
  } finally {
    extracting.value = false;
  }
};
</script>
