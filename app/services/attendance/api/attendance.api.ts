import { apiFetch, asData, asPaginated } from "~/utils/apiFetch";
import type {
  AttendanceDay,
  AttendanceLocationInput,
  AttendanceQuery,
  AttendanceToday,
} from "../types";

function appendLocation(body: FormData, location?: AttendanceLocationInput) {
  if (!location) return;
  if (location.latitude != null && location.longitude != null) {
    body.append("latitude", String(location.latitude));
    body.append("longitude", String(location.longitude));
    body.append("accuracy", String(location.accuracy ?? 0));
    return;
  }
  if (location.signal) body.append("locationSignal", location.signal);
}

export const attendanceApi = {
  /** GET /admin-api/attendance/today → AttendanceToday */
  async getToday(): Promise<AttendanceToday> {
    return asData<AttendanceToday>(
      await apiFetch("/admin-api/attendance/today", { method: "GET" }),
    );
  },

  /** POST /admin-api/attendance/check-in multipart photo */
  async checkIn(
    photo: File,
    location?: AttendanceLocationInput,
  ): Promise<AttendanceToday["checkIn"]> {
    const body = new FormData();
    body.append("photo", photo);
    appendLocation(body, location);
    return asData(
      await apiFetch("/admin-api/attendance/check-in", { method: "POST", body }),
    );
  },

  /** POST /admin-api/attendance/check-out multipart photo */
  async checkOut(
    photo: File,
    location?: AttendanceLocationInput,
  ): Promise<AttendanceToday["checkOut"]> {
    const body = new FormData();
    body.append("photo", photo);
    appendLocation(body, location);
    return asData(
      await apiFetch("/admin-api/attendance/check-out", { method: "POST", body }),
    );
  },

  /** GET /admin-api/attendance → paginated days */
  async getDays(params: AttendanceQuery = {}) {
    return asPaginated<AttendanceDay>(
      await apiFetch("/admin-api/attendance", { method: "GET", params }),
    );
  },

  /** GET /admin-api/attendance/photos/:attendanceId → signed fileUrl, fetched when the preview opens */
  async getPhoto(attendanceId: string): Promise<{ fileUrl: string }> {
    return asData<{ fileUrl: string }>(
      await apiFetch(`/admin-api/attendance/photos/${attendanceId}`, { method: "GET" }),
    );
  },

  /** GET /admin-api/attendance/days/:employeeId/:workDate */
  async getDay(employeeId: string, workDate: string): Promise<AttendanceDay> {
    return asData<AttendanceDay>(
      await apiFetch(`/admin-api/attendance/days/${employeeId}/${workDate}`, {
        method: "GET",
      }),
    );
  },
};
