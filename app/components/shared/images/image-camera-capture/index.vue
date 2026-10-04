<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :show-header="false"
    :style="{ width: '95vw', maxWidth: '520px' }"
    :closable="false"
    :close-on-escape="!starting"
    :dismissable-mask="false"
    :draggable="false"
    :pt="{
      root: {
        class:
          'overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl md:!w-[380px] md:!max-w-[380px]',
      },
      content: { class: '!p-0 bg-slate-950' },
    }"
    @show="onDialogShow"
    @hide="onDialogHide"
    @update:visible="onVisibleUpdate"
  >
    <div class="relative overflow-hidden bg-slate-950 text-white" dir="rtl">
      <CameraCaptureHeader
        :disabled="starting"
        :title="title"
        :subtitle="subtitle"
        @close="close"
      />

      <CameraCapturePreview
        :starting="starting"
        :stream-ready="streamReady"
        :error="localError"
      >
        <video
          ref="videoRef"
          class="h-full w-full object-cover"
          :class="{ 'scale-x-[-1]': mirrorPreview }"
          autoplay
          playsinline
          muted
        />
        <template #canvas>
          <canvas ref="canvasRef" class="hidden" />
        </template>
      </CameraCapturePreview>

      <CameraCaptureActions
        :starting="starting"
        :stream-ready="streamReady"
        :error="localError"
        @close="close"
        @capture="capture"
      />
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import { useCameraCapture } from "./composables/useCameraCapture";
import CameraCaptureHeader from "./partials/CameraCaptureHeader.vue";
import CameraCapturePreview from "./partials/CameraCapturePreview.vue";
import CameraCaptureActions from "./partials/CameraCaptureActions.vue";

defineOptions({ name: "ImageCameraCapture" });

defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "التقاط صورة الإثبات" },
  subtitle: { type: String, default: "وجّه الكاميرا ثم اضغط التقاط" },
});

const emit = defineEmits(["update:visible", "captured", "error"]);

const {
  videoRef,
  canvasRef,
  starting,
  streamReady,
  localError,
  mirrorPreview,
  close,
  onVisibleUpdate,
  onDialogShow,
  onDialogHide,
  capture,
} = useCameraCapture(emit);
</script>
