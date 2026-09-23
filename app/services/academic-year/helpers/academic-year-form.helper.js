export const emptyAcademicYearForm = () => ({
  name: "",
  startDate: null,
  endDate: null,
});

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
};

export const toIsoDate = (value) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const mapAcademicYearToForm = (year) => ({
  name: year?.name || "",
  startDate: toDate(year?.startDate),
  endDate: toDate(year?.endDate),
});

export const buildAcademicYearCreatePayload = (form) => ({
  name: String(form.name || "").trim(),
  startDate: toIsoDate(form.startDate),
  endDate: toIsoDate(form.endDate),
});

export const buildAcademicYearUpdatePayload = (form) => ({
  startDate: toIsoDate(form.startDate),
  endDate: toIsoDate(form.endDate),
});

export const validateAcademicYearDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return "تاريخ البداية والنهاية مطلوبان.";
  }
  if (new Date(endDate) < new Date(startDate)) {
    return "تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية.";
  }
  return null;
};
