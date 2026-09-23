/**
 * Notification API contracts — aligned with BE `toNotificationResponse`.
 * Reads nest `branch` / `product`; flat FK / name fields are omitted.
 */

export type NamedRef = {
  id: string;
  name: string;
};

/**
 * Stable response from:
 * GET /notifications
 */
export type NotificationResponse = {
  id: string;
  type: string;
  createdAt: string;
  availableQuantity: number;
  physicalQuantity: number;
  reservedQuantity: number;
  threshold: number;
  branch: NamedRef | null;
  product: NamedRef | null;
};

/** GET /notifications query params. */
export type NotificationQuery = {
  academicYearId?: string;
};

/** List/display row after `normalizeNotificationListItem`. */
export type NotificationListItem = NotificationResponse & {
  title: string;
  message: string;
};
