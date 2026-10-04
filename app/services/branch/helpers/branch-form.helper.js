import { getStatusTagMeta } from "~/utils/status-tags/catalog";

export const emptyBranchForm = () => ({
  name: "",
  address: "",
  phone: "",
  isActive: true,
  latitude: null,
  longitude: null,
  attendanceRadiusMeters: 100,
});

export const mapBranchToForm = (branch) => ({
  name: branch?.name || "",
  address: branch?.address || "",
  phone: branch?.phone || "",
  isActive: branch ? branch.status !== "INACTIVE" : true,
  latitude: branch?.latitude ?? branch?.location?.latitude ?? null,
  longitude: branch?.longitude ?? branch?.location?.longitude ?? null,
  attendanceRadiusMeters: branch?.attendanceRadiusMeters ?? 100,
});

const coordinate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const buildBranchPayload = (form) => ({
  name: String(form.name || "").trim(),
  address: form.address?.trim() || undefined,
  phone: form.phone?.trim() || undefined,
  latitude: coordinate(form.latitude),
  longitude: coordinate(form.longitude),
  attendanceRadiusMeters: Number(form.attendanceRadiusMeters ?? 100),
});

export const normalizeBranchListItem = (branch) => {
  const meta = getStatusTagMeta("entity", branch.status);

  return {
    id: branch.id,
    name: branch.name || "-",
    address: branch.address || "",
    phone: branch.phone || "",
    status: branch.status,
    statusLabel: meta.label,
    locationLabel: branch.location?.latitude != null ? "محدّد" : "غير محدد",
    radiusLabel: `${branch.attendanceRadiusMeters ?? 100} م`,
    latitude: branch.location?.latitude ?? null,
    longitude: branch.location?.longitude ?? null,
    attendanceRadiusMeters: branch.attendanceRadiusMeters ?? 100,
  };
};
