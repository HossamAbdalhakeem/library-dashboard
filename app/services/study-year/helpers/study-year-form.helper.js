export const emptyStudyYearForm = () => ({
  name: "",
});

/** Map API study year → form. */
export const mapStudyYearToForm = (studyYear) => ({
  name: studyYear?.name || "",
});

export const buildStudyYearPayload = (form) => ({
  name: String(form.name || "").trim(),
});

/** Picker/option shape for selects. */
export const mapStudyYearOption = (year, term = "") => ({
  label: year?.name || `سنة ${year?.id}`,
  value: year?.id || null,
  raw: year,
  ...(term ? { _remoteMatch: term } : {}),
});
