import { useAppToast } from "~/composables/useAppToast";
import {
  attendanceApi,
  formatAttendanceTime,
  formatWorkDateLabel,
} from "~/services/attendance";
import { readDeviceLocation } from "~/utils/device-location";

export function useEmployeeAttendance() {
  const { showError, showSuccess, showWarning } = useAppToast();

  const loading = ref(true);
  const submitting = ref(false);
  const cameraOpen = ref(false);
  const captureAction = ref(null);
  const previewUrl = ref("");
  const previewFile = ref(null);
  const today = ref({ date: "", checkIn: null, checkOut: null });
  const locationState = ref("idle");
  const locationReading = ref(null);
  const now = ref(new Date());
  let clockTimer = null;

  const dateLabel = computed(() => formatWorkDateLabel(today.value.date));
  const clockLabel = computed(() =>
    new Intl.DateTimeFormat("ar-EG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Cairo",
    }).format(now.value),
  );
  const checkInTime = computed(() =>
    formatAttendanceTime(today.value.checkIn?.occurredAt),
  );
  const checkOutTime = computed(() =>
    formatAttendanceTime(today.value.checkOut?.occurredAt),
  );
  const completed = computed(
    () => Boolean(today.value.checkIn && today.value.checkOut),
  );
  const locationLabel = computed(() => {
    if (locationState.value === "locating") return "جاري تحديد الموقع...";
    if (locationState.value === "fix") return "تم تحديد الموقع";
    if (locationState.value === "insecure") {
      return "الموقع يحتاج رابط HTTPS";
    }
    if (locationState.value === "denied") {
      return "اسمح للمتصفح باستخدام الموقع";
    }
    if (locationState.value === "missing") return "تعذر تحديد الموقع";
    return "سيُطلب الموقع عند التسجيل";
  });
  const locationTone = computed(() => {
    if (locationState.value === "fix") return "ok";
    if (
      locationState.value === "missing" ||
      locationState.value === "insecure" ||
      locationState.value === "denied"
    ) {
      return "warn";
    }
    if (locationState.value === "locating") return "busy";
    return "idle";
  });
  const locationIcon = computed(() => {
    if (locationState.value === "locating") return "pi pi-spin pi-spinner";
    if (locationState.value === "missing") return "pi pi-exclamation-triangle";
    if (locationState.value === "fix") return "pi pi-check-circle";
    return "pi pi-map-marker";
  });
  const shiftStatus = computed(() => {
    if (completed.value) {
      return {
        key: "done",
        label: "اكتمل اليوم",
        hint: "تم تسجيل الحضور والانصراف",
      };
    }
    if (today.value.checkIn) {
      return {
        key: "in",
        label: "في الدوام",
        hint: "بانتظار تسجيل الانصراف",
      };
    }
    return {
      key: "waiting",
      label: "بانتظار الحضور",
      hint: "سجّل حضورك",
    };
  });
  const checkInStateClass = computed(() =>
    today.value.checkIn ? "att-step--done" : "att-step--active",
  );
  const checkOutStateClass = computed(() => {
    if (today.value.checkOut) return "att-step--done";
    if (today.value.checkIn) return "att-step--active";
    return "att-step--locked";
  });
  const checkOutHint = computed(() => {
    if (today.value.checkOut) return checkOutTime.value;
    if (!today.value.checkIn) return "يُتاح بعد تسجيل الحضور";
    return "لم يتم التسجيل";
  });

  const revokePreview = () => {
    if (previewUrl.value?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = "";
    previewFile.value = null;
  };

  const loadToday = async ({ silent = false } = {}) => {
    if (!silent) loading.value = true;
    try {
      today.value = await attendanceApi.getToday();
    } catch (error) {
      showError(error?.message || "تعذر تحميل حضور اليوم.");
      if (!silent) today.value = { date: "", checkIn: null, checkOut: null };
    } finally {
      loading.value = false;
    }
  };

  const applyLocationReading = (reading) => {
    locationReading.value = reading;
    if (reading.latitude != null) {
      locationState.value = "fix";
      return;
    }
    if (reading.signal === "insecure" || reading.signal === "denied") {
      locationState.value = reading.signal;
      return;
    }
    locationState.value = "missing";
  };

  const captureLocation = async () => {
    locationState.value = "locating";
    const reading = await readDeviceLocation();
    applyLocationReading(reading);
    return reading;
  };

  const openCapture = (action) => {
    captureAction.value = action;
    locationState.value = "locating";
    // Call this directly in the tap so iPhone Safari can show the prompt.
    readDeviceLocation().then((reading) => {
      applyLocationReading(reading);
      if (reading.signal === "denied") {
        showError(
          "سفاري مانع الموقع لهذه الصفحة. من شريط العنوان اضغط AA ثم Location ثم Allow، وبعدين حدّث الصفحة.",
        );
      } else if (reading.signal === "insecure") {
        showError("الآيفون يسمح بالموقع على رابط https فقط، وليس على 192.168.");
      }
      cameraOpen.value = true;
    });
  };

  const onCaptured = (file) => {
    if (!file) return;
    revokePreview();
    previewFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  };

  const onCameraError = (message) => {
    if (message) showError(message);
  };

  const retake = () => {
    revokePreview();
    cameraOpen.value = true;
  };

  const onPreviewVisible = (visible) => {
    if (!visible && !submitting.value) revokePreview();
  };

  const locationPayload = (reading) => {
    if (reading?.latitude != null && reading?.longitude != null) {
      return {
        latitude: reading.latitude,
        longitude: reading.longitude,
        accuracy: reading.accuracy ?? 0,
      };
    }
    return { signal: reading?.signal || "unavailable" };
  };

  const confirmPhoto = async () => {
    if (!previewFile.value || !captureAction.value) return;
    submitting.value = true;
    try {
      const reading = await captureLocation();
      const location = locationPayload(reading);
      const saved =
        captureAction.value === "check-in"
          ? await attendanceApi.checkIn(previewFile.value, location)
          : await attendanceApi.checkOut(previewFile.value, location);
      const verified = saved?.location?.status === "VERIFIED";
      if (verified) {
        showSuccess(
          captureAction.value === "check-in"
            ? "تم تسجيل الحضور."
            : "تم تسجيل الانصراف.",
        );
      } else {
        showWarning("تم التسجيل بدون التحقق من الموقع.");
      }
      revokePreview();
      await loadToday({ silent: true });
    } catch (error) {
      showError(error?.message || "تعذر تسجيل الحضور.");
    } finally {
      submitting.value = false;
    }
  };

  onMounted(() => {
    loadToday();
    clockTimer = window.setInterval(() => {
      now.value = new Date();
    }, 30_000);
  });
  onBeforeUnmount(() => {
    revokePreview();
    if (clockTimer) window.clearInterval(clockTimer);
  });

  return {
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
  };
}
