/** Browser geolocation. Never invents coordinates. */
export function readDeviceLocation({ timeout = 12000 } = {}) {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ signal: "unavailable" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(accuracy) ? accuracy : 0,
        });
      },
      (error) => {
        if (error?.code === 1) resolve({ signal: "denied" });
        else if (error?.code === 3) resolve({ signal: "timeout" });
        else resolve({ signal: "unavailable" });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout },
    );
  });
}
