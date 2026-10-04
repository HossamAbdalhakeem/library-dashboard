import { formatDateTime } from "~/utils/format/datetime";

const CAIRO = "Africa/Cairo";

export const ATTENDANCE_STATUS_OPTIONS = Object.freeze([
  { label: "الكل", value: "all" },
  { label: "حضور فقط", value: "open" },
  { label: "مكتمل", value: "complete" },
]);

/** Cairo calendar date as YYYY-MM-DD. */
export function cairoDateString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAIRO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Local Date whose calendar day matches Cairo today, for the date picker. */
export function cairoTodayDate() {
  const [year, month, day] = cairoDateString().split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateInput(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatWorkDateLabel(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = String(isoDate).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatAttendanceTime(value) {
  return formatDateTime(value, {
    locale: "ar-EG",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: CAIRO,
    empty: "—",
  });
}

export function attendanceLocationLabel(location) {
  if (location?.status === "VERIFIED") return "تم التحقق";
  if (location?.status === "DENIED") return "تم رفض الموقع";
  if (location?.status === "UNAVAILABLE") return "تعذر تحديد الموقع";
  return "بدون موقع";
}

export function formatAccuracyMeters(accuracy) {
  if (accuracy == null || Number.isNaN(Number(accuracy))) return "—";
  return `${Math.round(Number(accuracy))} متر`;
}

export function formatCoordinates(location) {
  if (location?.latitude == null || location?.longitude == null) return "—";
  const latitude = Number(location.latitude).toFixed(5);
  const longitude = Number(location.longitude).toFixed(5);
  return `${latitude} , ${longitude}`;
}

export function formatDayLocation(day) {
  const checkIn = attendanceLocationLabel(day?.checkIn?.location);
  if (!day?.checkOut) return checkIn;
  const checkOut = attendanceLocationLabel(day.checkOut.location);
  if (checkIn === checkOut) return checkIn;
  return `حضور: ${checkIn} · انصراف: ${checkOut}`;
}

export function buildAttendanceListQuery({ page, perPage, filters }) {
  const date = formatDateInput(filters.date);
  const branchId =
    filters.branchId && filters.branchId !== "all" ? filters.branchId : undefined;
  const status = filters.status && filters.status !== "all" ? filters.status : undefined;

  return {
    page,
    per_page: perPage,
    date: date || undefined,
    branchId,
    employeeId: filters.employeeId || undefined,
    status,
  };
}
