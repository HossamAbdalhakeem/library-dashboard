/**
 * Study-year API contracts — aligned with BE `toStudyYearResponse`.
 * Leaf entity: camelCase scalars only.
 */

/**
 * Stable response from:
 * GET /study-years, GET /study-years/:id,
 * POST /study-years, PATCH /study-years/:id
 */
export type StudyYearResponse = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /study-years query params. */
export type StudyYearQuery = Record<string, unknown>;

/** POST /study-years body. */
export type StudyYearPayload = {
  name: string;
};

/** PATCH /study-years/:id body. */
export type StudyYearUpdatePayload = {
  name?: string;
};
