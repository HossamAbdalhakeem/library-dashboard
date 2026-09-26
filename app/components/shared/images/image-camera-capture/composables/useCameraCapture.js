/**
 * getUserMedia stream + JPEG capture for ImageCameraCapture.
 */
export function useCameraCapture(emit) {
  const videoRef = ref(null);
  const canvasRef = ref(null);
  const starting = ref(false);
  const streamReady = ref(false);
  const localError = ref("");
  const mirrorPreview = ref(true);
  let mediaStream = null;
  let startToken = 0;

  const isMobileLike = () => {
    if (!import.meta.client) return false;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
  };

  const stopStream = () => {
    mediaStream?.getTracks?.().forEach((track) => track.stop());
    mediaStream = null;
    streamReady.value = false;
    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
  };

  const waitForVideoFrame = (video) =>
    new Promise((resolve, reject) => {
      if (!video) {
        reject(new Error("video missing"));
        return;
      }

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("video metadata timeout"));
      };

      const onReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) done();
      };

      const cleanup = () => {
        video.removeEventListener("loadedmetadata", onReady);
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("playing", onReady);
        clearTimeout(timer);
      };

      video.addEventListener("loadedmetadata", onReady);
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("playing", onReady);
      const timer = setTimeout(fail, 8000);
      onReady();
    });

  const requestStream = async () => {
    const attempts = isMobileLike()
      ? [
          { facingMode: { ideal: "environment" } },
          { facingMode: { ideal: "user" } },
          true,
        ]
      : [{ facingMode: "user" }, true];

    let lastError = null;
    for (const video of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: false,
          video,
        });
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("تعذر فتح الكاميرا.");
  };

  const attachStreamToVideo = async (stream) => {
    for (let i = 0; i < 8; i += 1) {
      await nextTick();
      if (videoRef.value) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const video = videoRef.value;
    if (!video) {
      throw new Error("تعذر تجهيز معاينة الكاميرا.");
    }

    video.setAttribute("playsinline", "true");
    video.muted = true;
    video.srcObject = stream;

    try {
      await video.play();
    } catch {
      // Autoplay can fail briefly; metadata wait below covers later playback.
    }

    await waitForVideoFrame(video);

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error(
        "الكاميرا تعمل لكن بدون صورة. أعد المحاولة أو استخدم رفع من الجهاز.",
      );
    }
  };

  const startCamera = async () => {
    const token = ++startToken;
    stopStream();
    localError.value = "";
    starting.value = true;
    streamReady.value = false;
    mirrorPreview.value = !isMobileLike();

    if (!import.meta.client || !navigator?.mediaDevices?.getUserMedia) {
      localError.value =
        "الكاميرا غير مدعومة في هذا المتصفح. استخدم رفع من الجهاز.";
      starting.value = false;
      emit("error", localError.value);
      return;
    }

    try {
      mediaStream = await requestStream();
      if (token !== startToken) {
        stopStream();
        return;
      }

      await attachStreamToVideo(mediaStream);
      if (token !== startToken) {
        stopStream();
        return;
      }

      streamReady.value = true;
    } catch (error) {
      if (token !== startToken) return;
      stopStream();
      const name = error?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        localError.value =
          "تم رفض إذن الكاميرا. اسمح بالوصول من إعدادات المتصفح أو استخدم رفع من الجهاز.";
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        localError.value = "لم يتم العثور على كاميرا متصلة بهذا الجهاز.";
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        localError.value =
          "الكاميرا مستخدمة من تطبيق آخر. أغلقه ثم أعد المحاولة.";
      } else {
        localError.value =
          error?.message ||
          "تعذر فتح الكاميرا. حاول مرة أخرى أو ارفع صورة من الجهاز.";
      }
      emit("error", localError.value);
    } finally {
      if (token === startToken) starting.value = false;
    }
  };

  const resetAndStop = () => {
    startToken += 1;
    stopStream();
    localError.value = "";
  };

  const close = () => {
    resetAndStop();
    emit("update:visible", false);
  };

  const onVisibleUpdate = (value) => {
    if (!value) resetAndStop();
    emit("update:visible", value);
  };

  const onDialogShow = () => {
    startCamera();
  };

  const onDialogHide = () => {
    startToken += 1;
    stopStream();
  };

  const capture = async () => {
    const video = videoRef.value;
    const canvas = canvasRef.value;
    if (!video || !canvas || !streamReady.value) return;

    const width = video.videoWidth || 0;
    const height = video.videoHeight || 0;
    if (!width || !height) {
      localError.value = "الكاميرا غير جاهزة بعد. انتظر لحظة ثم حاول مرة أخرى.";
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      localError.value = "تعذر التقاط الصورة.";
      return;
    }

    if (mirrorPreview.value) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.92);
    });

    if (!blob) {
      localError.value = "تعذر التقاط الصورة.";
      return;
    }

    const file = new File([blob], `camera-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    startToken += 1;
    stopStream();
    emit("captured", file);
    emit("update:visible", false);
  };

  onBeforeUnmount(() => {
    startToken += 1;
    stopStream();
  });

  return {
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
  };
}
