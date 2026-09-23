import { apiFetch, asList } from "~/utils/apiFetch";
import type {
  NotificationQuery,
  NotificationResponse,
} from "../types/notification.types";

export const notificationApi = {
  /** GET /notifications → NotificationResponse[] */
  async getNotifications(
    params: NotificationQuery = {},
  ): Promise<NotificationResponse[]> {
    return asList<NotificationResponse>(
      await apiFetch("/notifications", { method: "GET", params }),
    );
  },
};

/** @deprecated Prefer `notificationApi` */
export const notificationService = notificationApi;
