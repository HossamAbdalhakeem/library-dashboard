/**
 * Image upload + cropper state for ImageUpload.
 */
export function useImageUpload(props, emit) {
  const inputRef = ref(null);
  const cameraInputRef = ref(null);
  const previewUrl = ref("");
  const errorMessage = ref("");
  const fileMeta = ref("");
  const showCropper = ref(false);
  const cropperMounted = ref(false);
  const showCameraCapture = ref(false);
  const selectedImage = ref("");
  const isProcessing = ref(false);
  const originalFileName = ref("cropped-image.jpg");

  const maxBytes = computed(() => {
    if (props.maxSizeBytes != null && props.maxSizeBytes > 0) {
      return props.maxSizeBytes;
    }
    return Math.max(0.05, props.maxSizeMb) * 1024 * 1024;
  });

  const maxSizeLabel = computed(() => {
    const bytes = maxBytes.value;
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} ك.ب`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
  });

  const revokePreview = () => {
    if (previewUrl.value?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = "";
  };

  const openPicker = () => {
    inputRef.value?.click();
  };

  const openCamera = () => {
    errorMessage.value = "";
    // Prefer getUserMedia dialog — works on laptop webcams and modern phones.
    // File-input capture= is unreliable on desktop browsers.
    if (import.meta.client && navigator?.mediaDevices?.getUserMedia) {
      showCameraCapture.value = true;
      return;
    }
    cameraInputRef.value?.click();
  };

  const resetFileInputs = () => {
    if (inputRef.value) inputRef.value.value = "";
    if (cameraInputRef.value) cameraInputRef.value.value = "";
  };

  const clear = () => {
    revokePreview();
    errorMessage.value = "";
    fileMeta.value = "";
    selectedImage.value = "";
    originalFileName.value = "cropped-image.jpg";
    resetFileInputs();
    emit("update:modelValue", null);
    emit("clear");
  };

  const openCropper = () => {
    if (!previewUrl.value && !selectedImage.value) return;
    selectedImage.value = selectedImage.value || previewUrl.value;
    cropperMounted.value = true;
    showCropper.value = true;
  };

  const processSelectedFile = (file) => {
    errorMessage.value = "";

    if (!file.type.startsWith("image/")) {
      errorMessage.value = "يسمح برفع الصور فقط.";
      emit("error", errorMessage.value);
      resetFileInputs();
      return;
    }

    if (file.size > maxBytes.value) {
      errorMessage.value = `حجم الصورة كبير. الحد الأقصى ${maxSizeLabel.value}.`;
      emit("error", errorMessage.value);
      resetFileInputs();
      return;
    }

    originalFileName.value = file.name || "camera-photo.jpg";

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage.value = String(e.target?.result || "");
      cropperMounted.value = true;
      showCropper.value = true;
    };
    reader.onerror = () => {
      errorMessage.value = "تعذر قراءة الصورة.";
      emit("error", errorMessage.value);
    };
    reader.readAsDataURL(file);
    resetFileInputs();
  };

  const onCameraCaptured = (file) => {
    showCameraCapture.value = false;
    if (!file) return;
    processSelectedFile(file);
  };

  const onCameraError = (message) => {
    if (message) {
      errorMessage.value = message;
      emit("error", message);
    }
  };

  const onFileChange = (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleCropped = async ({ blob, dataURL }) => {
    if (!blob) {
      errorMessage.value = "تعذر قص الصورة.";
      emit("error", errorMessage.value);
      return;
    }

    isProcessing.value = true;

    try {
      const extension = blob.type === "image/png" ? "png" : "jpg";
      const baseName =
        String(originalFileName.value).replace(/\.[^.]+$/, "") ||
        "cropped-image";
      const file = new File([blob], `${baseName}.${extension}`, {
        type: blob.type || "image/jpeg",
      });

      if (file.size > maxBytes.value) {
        errorMessage.value = `حجم الصورة بعد القص كبير. الحد الأقصى ${maxSizeLabel.value}.`;
        emit("error", errorMessage.value);
        return;
      }

      revokePreview();
      previewUrl.value = dataURL || URL.createObjectURL(file);
      selectedImage.value = previewUrl.value;
      fileMeta.value = `${file.name} `;

      emit("update:modelValue", file);
      emit("select", file);
      emit("cropped", { blob, dataURL, file });

      if (typeof props.uploadHandler === "function") {
        await props.uploadHandler(file);
      }

      showCropper.value = false;
    } catch (error) {
      errorMessage.value =
        error?.message || "تعذر حفظ أو رفع الصورة المقصوصة.";
      emit("error", error);
    } finally {
      isProcessing.value = false;
    }
  };

  const handleCropperError = (error) => {
    errorMessage.value = "تعذر قص الصورة. حاول مرة أخرى.";
    emit("error", error);
  };

  const handleCropperClose = (isOpen) => {
    if (!isOpen && isProcessing.value) {
      showCropper.value = true;
      return;
    }
    if (!isOpen) {
      selectedImage.value = previewUrl.value || "";
    }
  };

  const handleUploadNew = () => {
    if (isProcessing.value) return;
    showCropper.value = false;
    nextTick(() => openPicker());
  };

  watch(
    () => props.modelValue,
    (value) => {
      if (value) return;
      if (!previewUrl.value && !fileMeta.value && !errorMessage.value) return;
      revokePreview();
      errorMessage.value = "";
      fileMeta.value = "";
      selectedImage.value = "";
      resetFileInputs();
    },
  );

  onBeforeUnmount(() => {
    revokePreview();
    showCameraCapture.value = false;
  });

  return {
    inputRef,
    cameraInputRef,
    previewUrl,
    errorMessage,
    fileMeta,
    showCropper,
    cropperMounted,
    showCameraCapture,
    selectedImage,
    isProcessing,
    maxSizeLabel,
    openPicker,
    openCamera,
    clear,
    openCropper,
    onFileChange,
    onCameraCaptured,
    onCameraError,
    handleCropped,
    handleCropperError,
    handleCropperClose,
    handleUploadNew,
  };
}
