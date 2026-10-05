/** Browser geolocation. Never invents coordinates. */

const FRESH_MS = 60_000;

let pendingRead = null;
let lastFix = null;
let lastFixAt = 0;

const positionOptions = [
  { enableHighAccuracy: true, maximumAge: FRESH_MS, timeout: 8_000 },
  { enableHighAccuracy: false, maximumAge: 5 * 60_000, timeout: 20_000 },
];

const signalForError = (error) => {
  if (error?.code === 1) return "denied";
  if (error?.code === 3) return "timeout";
  return "unavailable";
};

const readPosition = (options) =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

const readingFromPosition = (position) => {
  const accuracy = position.coords.accuracy;
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : 0,
  };
};

async function readFreshLocation() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { signal: "unavailable" };
  }

  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return { signal: "insecure" };
  }

  let signal = "unavailable";

  for (const options of positionOptions) {
    try {
      const position = await readPosition(options);
      const reading = readingFromPosition(position);
      lastFix = reading;
      lastFixAt = Date.now();
      return reading;
    } catch (error) {
      signal = signalForError(error);
      if (signal === "denied") break;
    }
  }

  return { signal };
}

export function readDeviceLocation() {
  if (lastFix && Date.now() - lastFixAt < FRESH_MS) {
    return Promise.resolve(lastFix);
  }

  if (!pendingRead) {
    pendingRead = readFreshLocation().finally(() => {
      pendingRead = null;
    });
  }

  return pendingRead;
}
