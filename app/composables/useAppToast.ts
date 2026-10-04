import { useToast } from "primevue/usetoast";

const isSessionGoneMessage = (detail) => {
  const text = String(detail || "").trim().toLowerCase();
  return (
    text === "not authenticated." ||
    text === "not authenticated" ||
    text === "session_cleared" ||
    text.includes("not authenticated")
  );
};

const isRequestAbortedMessage = (detail) =>
  String(detail || "").trim() === "REQUEST_ABORTED";

export const useAppToast = () => {
  const toast = useToast();

  const showError = (detail, summary = "خطأ") => {
    // Ignore client-side session-cleared errors after logout (no API call),
    // and reads cancelled because the user changed route.
    if (isSessionGoneMessage(detail) || isRequestAbortedMessage(detail)) return;

    toast.add({
      severity: "error",
      summary,
      detail: detail || "حدث خطأ غير متوقع.",
      life: 4500,
    });
  };

  const showSuccess = (detail, summary = "تم بنجاح") => {
    toast.add({
      severity: "success",
      summary,
      detail: detail || "تمت العملية بنجاح.",
      life: 3500,
    });
  };

  const showWarning = (detail, summary = "تنبيه") => {
    toast.add({
      severity: "warn",
      summary,
      detail: detail || "تحقق من البيانات.",
      life: 4500,
    });
  };

  return { toast, showError, showSuccess, showWarning };
};
