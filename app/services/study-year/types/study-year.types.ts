/**
 * Study-year API contracts — aligned with BE `toStudyYearResponse`.
 * Leaf entity: camelCase scalars only.
 */

/** Entity status as returned by the API. */
export type StudyYearStatus = "ACTIVE" | "INACTIVE";

/**
 * Stable response from:
 * GET /admin-api/study-years,
 * POST /admin-api/study-years,
 * PATCH /admin-api/study-years/:id,
 * PATCH /admin-api/study-years/:id/status
 */
export type StudyYearResponse = {
  id: string;
  name: string;
  status: StudyYearStatus | string;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /admin-api/study-years query params. */
export type StudyYearQuery = Record<string, unknown>;

/** POST /admin-api/study-years body. */
export type StudyYearPayload = {
  name: string;
};

/** PATCH /admin-api/study-years/:id body. Rename does not change status. */
export type StudyYearUpdatePayload = {
  name?: string;
};

/** PATCH /admin-api/study-years/:id/status body. */
export type StudyYearStatusPayload = {
  status: StudyYearStatus;
};

/** List/table row after `normalizeStudyYearListItem`. */
export type StudyYearListItem = {
  id: string;
  name: string;
  status: StudyYearStatus | string;
  statusLabel: string;
  createdAt?: string;
  updatedAt?: string;
};
