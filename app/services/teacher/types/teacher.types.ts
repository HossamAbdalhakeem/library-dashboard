/**
 * Teacher API contracts — aligned with BE `toTeacherResponse`.
 * Reads nest `academicYear`; flat `academicYearId` is omitted on responses.
 */

export type NamedRef = {
  id: string;
  name: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

/** Entity status as returned by the API. */
export type TeacherStatus = "ACTIVE" | "INACTIVE";

/**
 * Stable response from:
 * GET /teachers, GET /teachers/:id,
 * POST /teachers, PATCH /teachers/:id, PATCH /teachers/:id/status
 */
export type TeacherResponse = {
  id: string;
  name: string;
  status: TeacherStatus | string;
  academicYear: AcademicYearRef | null;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /teachers query params. */
export type TeacherQuery = {
  academicYearId?: string;
  search?: string;
  status?: string;
};

/** POST /teachers body. */
export type TeacherPayload = {
  name: string;
  academicYearId?: string;
};

/** PATCH /teachers/:id body. */
export type TeacherUpdatePayload = {
  name?: string;
};

/** PATCH /teachers/:id/status body. */
export type TeacherStatusPayload = {
  status: TeacherStatus;
};

/** List/table row after `normalizeTeacherListItem`. */
export type TeacherListItem = TeacherResponse & {
  statusLabel: string;
};
