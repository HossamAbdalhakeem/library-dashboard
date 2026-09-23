/**
 * Academic-year API contracts — aligned with BE `toAcademicYearResponse`.
 * Leaf entity: camelCase scalars only.
 */

export type AcademicYearStatus = "ACTIVE" | "INACTIVE";

/**
 * Stable response from:
 * GET /academic-years, GET /academic-years/:id,
 * POST /academic-years, PATCH /academic-years/:id,
 * POST /academic-years/:id/activate
 */
export type AcademicYearResponse = {
  id: string;
  name: string;
  status: AcademicYearStatus | string;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /academic-years query params. */
export type AcademicYearQuery = Record<string, unknown>;

/** POST /academic-years body. */
export type AcademicYearPayload = {
  name: string;
  startDate: string;
  endDate: string;
};

/** PATCH /academic-years/:id body (name cannot be changed). */
export type AcademicYearUpdatePayload = {
  startDate?: string;
  endDate?: string;
};
