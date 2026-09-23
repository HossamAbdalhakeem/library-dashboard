import { getLabel } from "./shared";

export const AVAILABILITY_LABELS = {
  AVAILABLE: "متاح",
  UNAVAILABLE: "غير متاح",
};

export const getAvailabilityLabel = (value) => {
  if (value === true || value === "AVAILABLE" || value === "available") {
    return AVAILABILITY_LABELS.AVAILABLE;
  }
  if (value === false || value === "UNAVAILABLE" || value === "unavailable") {
    return AVAILABILITY_LABELS.UNAVAILABLE;
  }
  return getLabel(AVAILABILITY_LABELS, value, String(value || "—"));
};
