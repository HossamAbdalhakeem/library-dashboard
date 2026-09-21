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

export const useAppToast = () => {
  const toast = useToast();

  const showError = (detail, summary = "خطأ") => {
    // Ignore client-side session-cleared errors after logout (no API call).
    if (isSessionGoneMessage(detail)) return;

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

  return { toast, showError, showSuccess };
};
