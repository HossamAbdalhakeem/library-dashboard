/** Browser geolocation. Never invents coordinates. */

const FRESH_MS = 60_000;

let pendingRead = null;
let lastFix = null;
let lastFixAt = 0;

const signalForError = (error) => {
  if (error?.code === 1) return "denied";
  if (error?.code === 3) return "timeout";
  return "unavailable";
};

const readingFromPosition = (position) => {
  const accuracy = position.coords.accuracy;
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : 0,
  };
};

/**
 * Starts getCurrentPosition in this turn so iPhone Safari still treats it
 * as the button tap. An async wrapper drops that gesture and the prompt
 * never appears.
 */
function startRead() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ signal: "unavailable" });
  }

  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return Promise.resolve({ signal: "insecure" });
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (reading) => {
      if (settled) return;
      settled = true;
      if (reading.latitude != null) {
        lastFix = reading;
        lastFixAt = Date.now();
      }
      resolve(reading);
    };

    const onFineError = (error) => {
      const signal = signalForError(error);
      if (signal === "denied") {
        finish({ signal });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => finish(readingFromPosition(position)),
        (coarseError) => finish({ signal: signalForError(coarseError) }),
        { enableHighAccuracy: false, maximumAge: 5 * 60_000, timeout: 20_000 },
      );
    };

    navigator.geolocation.getCurrentPosition(
      (position) => finish(readingFromPosition(position)),
      onFineError,
      { enableHighAccuracy: true, maximumAge: FRESH_MS, timeout: 8_000 },
    );
  });
}

export function readDeviceLocation() {
  if (lastFix && Date.now() - lastFixAt < FRESH_MS) {
    return Promise.resolve(lastFix);
  }

  if (!pendingRead) {
    pendingRead = startRead().finally(() => {
      pendingRead = null;
    });
  }

  return pendingRead;
}
