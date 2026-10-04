<template>
  <div class="mx-auto w-full max-w-xl" dir="rtl">
    <AttendanceTodayCard
      :loading="loading"
      :submitting="submitting"
      :today="today"
      :date-label="dateLabel"
      :clock-label="clockLabel"
      :shift-status="shiftStatus"
      :location-label="locationLabel"
      :location-tone="locationTone"
      :location-icon="locationIcon"
      :check-in-time="checkInTime"
      :check-out-hint="checkOutHint"
      :check-in-state-class="checkInStateClass"
      :check-out-state-class="checkOutStateClass"
      :completed="completed"
      @check-in="openCapture('check-in')"
      @check-out="openCapture('check-out')"
    />

    <ImageCameraCapture
      :visible="cameraOpen"
      title="صورة الحضور"
      subtitle="وجّه الكاميرا ثم اضغط التقاط"
      @update:visible="cameraOpen = $event"
      @captured="onCaptured"
      @error="onCameraError"
    />

    <AttendancePhotoConfirmDialog
      :preview-url="previewUrl"
      :submitting="submitting"
      :location-icon="locationIcon"
      :location-label="locationLabel"
      @update:visible="onPreviewVisible"
      @retake="retake"
      @confirm="confirmPhoto"
    />
  </div>
</template>

<script setup>
import AttendanceTodayCard from "./components/AttendanceTodayCard.vue";
import AttendancePhotoConfirmDialog from "./components/dialog/AttendancePhotoConfirmDialog.vue";
import { useEmployeeAttendance } from "./composables/useEmployeeAttendance";

defineOptions({ name: "AttendancePageIndex" });

const ImageCameraCapture = defineAsyncComponent(() =>
  import("~/components/shared/images/image-camera-capture/index.vue"),
);

const {
  loading,
  submitting,
  cameraOpen,
  previewUrl,
  today,
  dateLabel,
  clockLabel,
  shiftStatus,
  locationLabel,
  locationTone,
  locationIcon,
  checkInTime,
  checkOutHint,
  checkInStateClass,
  checkOutStateClass,
  completed,
  openCapture,
  onCaptured,
  onCameraError,
  retake,
  onPreviewVisible,
  confirmPhoto,
} = useEmployeeAttendance();
</script>
