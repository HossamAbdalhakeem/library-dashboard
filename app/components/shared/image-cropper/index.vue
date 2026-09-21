<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :header="title || 'قص الصورة'"
    :style="{ width: '95vw', maxWidth: '1000px', maxHeight: '96vh' }"
    :closable="!isBusy"
    :close-on-escape="!isBusy"
    :dismissable-mask="false"
    :draggable="false"
    :pt="{ header: { class: 'pb-0 text-right' }, content: { class: 'text-right' } }"
    @hide="handleClose"
    @update:visible="onVisibleUpdate"
  >
    <div
      v-if="!imageSrc"
      class="flex h-[400px] w-full flex-col items-center justify-center"
    >
      <i class="pi pi-image mb-4 text-4xl text-slate-400" />
      <p class="text-slate-400">لم يتم اختيار صورة</p>
    </div>

    <div v-else class="grid min-h-[500px] grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      <div class="flex flex-col gap-4">
        <h3 class="text-lg font-semibold text-slate-200">تعديل</h3>
        <div class="min-h-[400px] flex-1 overflow-hidden rounded-lg bg-black">
          <img
            ref="imageRef"
            :src="imageSrc"
            alt="قص الصورة"
            class="block max-w-full"
            @load="onImageLoad"
          />
        </div>
        <Button
          label="رفع صورة جديدة"
          icon="pi pi-upload"
          size="small"
          class="mx-auto max-w-fit"
          :disabled="isBusy"
          @click="handleUploadNew"
        />
      </div>

      <div class="flex flex-col gap-4">
        <h3 class="text-lg font-semibold text-slate-200">معاينة</h3>
        <div
          class="flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-black"
        >
          <img
            v-if="previewImage"
            :src="previewImage"
            alt="معاينة القص"
            class="max-h-full max-w-full rounded border-2 border-dashed border-white object-contain"
          />
          <div
            v-else
            class="flex flex-col items-center justify-center text-center text-slate-400"
          >
            <i class="pi pi-image text-2xl" />
            <p class="mt-2 text-sm">ستظهر المعاينة هنا</p>
          </div>
        </div>
        <div class="flex justify-center gap-2">
          <Button
            label="إلغاء"
            severity="danger"
            size="small"
            :disabled="isBusy"
            @click="handleCancel"
          />
          <Button
            label="تأكيد القص"
            severity="success"
            size="small"
            :loading="isBusy"
            :disabled="isBusy"
            @click="handleCrop"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";

defineOptions({ name: "ImageCropper" });

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  imageSrc: { type: String, default: "" },
  title: { type: String, default: "قص الصورة" },
  aspectRatio: { type: Number, default: NaN },
  viewMode: { type: Number, default: 1 },
  dragMode: { type: String, default: "crop" },
  autoCropArea: { type: Number, default: 1 },
  background: { type: Boolean, default: true },
  responsive: { type: Boolean, default: true },
  restore: { type: Boolean, default: true },
  checkCrossOrigin: { type: Boolean, default: true },
  checkOrientation: { type: Boolean, default: true },
  modal: { type: Boolean, default: true },
  guides: { type: Boolean, default: true },
  center: { type: Boolean, default: true },
  highlight: { type: Boolean, default: true },
  cropBoxMovable: { type: Boolean, default: true },
  cropBoxResizable: { type: Boolean, default: true },
  toggleDragModeOnDblclick: { type: Boolean, default: true },
  minContainerWidth: { type: Number, default: 200 },
  minContainerHeight: { type: Number, default: 200 },
  minCropBoxWidth: { type: Number, default: 0 },
  minCropBoxHeight: { type: Number, default: 0 },
  outputFormat: { type: String, default: "image/jpeg" },
  outputQuality: { type: Number, default: 0.9 },
  processing: { type: Boolean, default: false },
  closeOnCropped: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "cropped", "error", "upload-new"]);

const visible = ref(props.modelValue);
const imageRef = ref(null);
const cropper = ref(null);
const CropperCtor = shallowRef(null);
const isProcessing = ref(false);
const previewImage = ref("");
const assetsReady = ref(false);
let assetsPromise = null;

const isBusy = computed(
  () => Boolean(props.processing) || Boolean(isProcessing.value),
);

const ensureCropperAssets = async () => {
  if (assetsReady.value && CropperCtor.value) return CropperCtor.value;

  if (!assetsPromise) {
    assetsPromise = Promise.all([
      import("~/assets/css/cropper.css"),
      import("cropperjs"),
    ]).then(([, cropperModule]) => {
      CropperCtor.value = cropperModule.default || cropperModule;
      assetsReady.value = true;
      return CropperCtor.value;
    });
  }

  return assetsPromise;
};

const destroyCropper = () => {
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
};

const updatePreview = () => {
  if (!cropper.value) return;

  const canvas = cropper.value.getCroppedCanvas({
    maxWidth: 1000,
    maxHeight: 1000,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
  });

  if (canvas) {
    previewImage.value = canvas.toDataURL("image/jpeg", 0.9);
  }
};

const initCropper = async () => {
  await nextTick();
  if (!imageRef.value || !props.imageSrc || !visible.value) return;

  const Cropper = await ensureCropperAssets();
  if (!Cropper || !imageRef.value || !visible.value) return;

  destroyCropper();

  cropper.value = new Cropper(imageRef.value, {
    aspectRatio: props.aspectRatio > 0 ? props.aspectRatio : NaN,
    viewMode: props.viewMode,
    dragMode: props.dragMode,
    autoCropArea: props.autoCropArea,
    background: props.background,
    responsive: props.responsive,
    restore: props.restore,
    checkCrossOrigin: props.checkCrossOrigin,
    checkOrientation: props.checkOrientation,
    modal: props.modal,
    guides: props.guides,
    center: props.center,
    highlight: props.highlight,
    cropBoxMovable: props.cropBoxMovable,
    cropBoxResizable: props.cropBoxResizable,
    toggleDragModeOnDblclick: props.toggleDragModeOnDblclick,
    minContainerWidth: props.minContainerWidth,
    minContainerHeight: props.minContainerHeight,
    minCropBoxWidth: props.minCropBoxWidth,
    minCropBoxHeight: props.minCropBoxHeight,
    ready() {
      updatePreview();
    },
    crop() {
      updatePreview();
    },
  });
};

const onImageLoad = () => {
  if (visible.value && props.imageSrc) {
    initCropper();
  }
};

watch(
  () => props.modelValue,
  async (value) => {
    visible.value = value;
    if (!value) {
      previewImage.value = "";
      destroyCropper();
      return;
    }
    await ensureCropperAssets();
    await nextTick();
    if (imageRef.value?.complete) {
      initCropper();
    }
  },
);

watch(visible, (value) => {
  emit("update:modelValue", value);
  if (!value) {
    previewImage.value = "";
    destroyCropper();
  }
});

watch(
  () => props.imageSrc,
  async (newSrc) => {
    if (!newSrc || !visible.value) return;
    await ensureCropperAssets();
    await nextTick();
    if (cropper.value) {
      cropper.value.replace(newSrc);
      return;
    }
    if (imageRef.value?.complete) {
      initCropper();
    }
  },
);

const handleCrop = async () => {
  if (!cropper.value) return;

  isProcessing.value = true;

  try {
    const canvas = cropper.value.getCroppedCanvas({
      maxWidth: 2048,
      maxHeight: 2048,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    if (!canvas) return;

    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (result) => resolve(result),
        props.outputFormat,
        props.outputQuality,
      );
    });

    const dataURL = canvas.toDataURL(props.outputFormat, props.outputQuality);
    emit("cropped", { blob, dataURL });

    if (props.closeOnCropped) {
      handleClose();
    }
  } catch (error) {
    emit("error", error);
  } finally {
    isProcessing.value = false;
  }
};

const handleUploadNew = () => {
  if (isBusy.value) return;
  emit("upload-new");
};

const handleCancel = () => {
  if (isBusy.value) return;
  handleClose();
};

const onVisibleUpdate = (val) => {
  if (!val && isBusy.value) {
    visible.value = true;
    return;
  }
  visible.value = val;
};

const handleClose = () => {
  if (isBusy.value) {
    visible.value = true;
    return;
  }
  visible.value = false;
};

onBeforeUnmount(() => {
  destroyCropper();
});
</script>
