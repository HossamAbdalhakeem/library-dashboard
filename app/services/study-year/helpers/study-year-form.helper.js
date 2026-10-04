import { getStatusTagMeta } from "~/utils/status-tags/catalog";

export const emptyStudyYearForm = () => ({
  name: "",
  isActive: true,
});

/** Map API study year → form. */
export const mapStudyYearToForm = (studyYear) => ({
  name: studyYear?.name || "",
  isActive: studyYear ? studyYear.status !== "INACTIVE" : true,
});

export const buildStudyYearPayload = (form) => ({
  name: String(form.name || "").trim(),
});

export const normalizeStudyYearListItem = (studyYear) => {
  const meta = getStatusTagMeta("entity", studyYear.status);

  return {
    id: studyYear.id,
    name: studyYear.name || "-",
    status: studyYear.status,
    statusLabel: meta.label,
    createdAt: studyYear.createdAt,
    updatedAt: studyYear.updatedAt,
  };
};

/** Picker/option shape for selects. */
export const mapStudyYearOption = (year, term = "") => ({
  label: year?.name || `سنة ${year?.id}`,
  value: year?.id || null,
  status: year?.status,
  raw: year,
  ...(term ? { _remoteMatch: term } : {}),
});
