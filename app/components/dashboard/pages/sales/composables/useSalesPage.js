import { saleService } from "~/services/saleService";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import { formatDateTime } from "~/utils/format";
import { useAppToast } from "~/composables/useAppToast";
import { useSalesProductSelection } from "./useSalesProductSelection";

export function useSalesPage() {
  const { showError } = useAppToast();
  const saving = ref(false);
  const formKey = ref(0);
  const proofFile = ref(null);
  const proofKey = ref("");
  const proofPreviewUrl = ref("");
  const proofRequiredError = ref(false);
  const paymentFieldsRef = ref(null);
  const successDialogVisible = ref(false);
  const saleSummary = ref(null);
  const selectedStudent = ref(null);

  const form = reactive({
    studentName: "",
    studentPhone: "",
    studyYearId: null,
    teacherId: null,
    productType: null,
    productId: null,
    quantity: 1,
    method: PaymentMethod.CASH,
  });

  const formInitialValues = {
    studentId: null,
    studentName: "",
    studentPhone: "",
    studyYearId: null,
    teacherId: null,
    productType: null,
    productId: null,
    quantity: 1,
    method: PaymentMethod.CASH,
  };

  const productSelection = useSalesProductSelection(form);
  const {
    products,
    selectedProductOption,
    onStudyYearChange,
    validateQuantity,
    quantityError,
  } = productSelection;

  const validateStudentSelection = (value) => {
    if (value) return true;
    return "اختر طالباً من القائمة أو أضف طالباً جديداً.";
  };

  const applyStudent = (student, setFieldValue) => {
    selectedStudent.value = student;
    form.studentName = student.name;
    form.studentPhone = student.phone;
    setFieldValue?.("studentId", student.id);
    setFieldValue?.("studentName", student.name);
    setFieldValue?.("studentPhone", student.phone);

    const studentStudyYearId =
      student.studyYearId ||
      student.studyYear?.id ||
      student.study_year_id ||
      null;
    if (studentStudyYearId && !form.studyYearId) {
      form.studyYearId = studentStudyYearId;
      setFieldValue?.("studyYearId", studentStudyYearId);
      onStudyYearChange(studentStudyYearId);
    }
  };

  const clearStudent = (setFieldValue) => {
    selectedStudent.value = null;
    form.studentName = "";
    form.studentPhone = "";
    setFieldValue?.("studentId", null);
    setFieldValue?.("studentName", "");
    setFieldValue?.("studentPhone", "");
  };

  const asText = (value, key = "") => {
    if (value == null) return "";
    if (typeof value === "object") {
      if (key && value[key] != null) return String(value[key]).trim();
      if (value.name != null && key === "name") return String(value.name).trim();
      if (value.phone != null && key === "phone")
        return String(value.phone).trim();
      return "";
    }
    return String(value).trim();
  };

  const ensureStudent = async () => {
    if (!selectedStudent.value?.id) {
      throw new Error("اختر طالباً من القائمة أو أضف طالباً جديداً.");
    }

    form.studentName = selectedStudent.value.name;
    form.studentPhone = selectedStudent.value.phone;
    return selectedStudent.value.id;
  };

  const onPaymentChange = ({ method, image, imageDataUrl, imagePreviewUrl }) => {
    proofRequiredError.value = false;
    form.method = method;
    proofFile.value = image;
    proofKey.value = imageDataUrl || "";
    proofPreviewUrl.value = imagePreviewUrl || "";
  };

  const closeSuccessDialog = () => {
    successDialogVisible.value = false;
    saleSummary.value = null;
  };

  const resetForm = () => {
    Object.assign(form, {
      studentName: "",
      studentPhone: "",
      studyYearId: null,
      teacherId: null,
      productType: null,
      productId: null,
      quantity: 1,
      method: PaymentMethod.CASH,
    });
    selectedStudent.value = null;
    products.value = [];
    proofFile.value = null;
    proofKey.value = "";
    proofPreviewUrl.value = "";
    proofRequiredError.value = false;
    quantityError.value = "";
    paymentFieldsRef.value?.reset?.();
    formKey.value += 1;
  };

  const submitSale = async () => {
    proofRequiredError.value = false;
    quantityError.value = "";

    if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) {
      proofRequiredError.value = true;
      return;
    }

    if (!validateQuantity()) {
      return;
    }

    saving.value = true;
    try {
      const studentId = await ensureStudent();
      const needsProof = paymentMethodNeedsProof(form.method);
      const product = selectedProductOption.value;
      const method = form.method;

      const sale = await saleService.createSale({
        studentId,
        productId: form.productId,
        quantity: Number(form.quantity),
        method,
        ...(needsProof && proofKey.value
          ? { proofReference: proofKey.value }
          : {}),
      });

      if (!sale?.id || !sale?.paymentId) {
        throw new Error("تعذر قراءة بيانات البيع من الخادم.");
      }

      saleSummary.value = {
        paymentNumber: sale.paymentId,
        dateTimeLabel: formatDateTime(sale.createdAt),
        productName: product?.name || "-",
        teacherName: product?.teacherName || "",
        studyYearName: product?.studyYearName || "",
        studentName: asText(form.studentName, "name") || "-",
        quantity: sale.quantity,
        unitPrice: Number(sale.unitPrice),
        totalAmount: Number(sale.totalAmount),
        methodLabel: PAYMENT_METHOD_LABELS[sale.method] || sale.method,
        proofImage: needsProof ? proofPreviewUrl.value || "" : "",
      };
      successDialogVisible.value = true;

      // Temporarily disabled — keep form values after successful sale
      // resetForm();
    } catch (error) {
      showError(error?.message || "تعذر تسجيل البيع.");
    } finally {
      saving.value = false;
    }
  };

  return reactive({
    saving,
    formKey,
    proofFile,
    proofKey,
    proofPreviewUrl,
    proofRequiredError,
    paymentFieldsRef,
    successDialogVisible,
    saleSummary,
    selectedStudent,
    form,
    formInitialValues,
    validateStudentSelection,
    applyStudent,
    clearStudent,
    onPaymentChange,
    closeSuccessDialog,
    resetForm,
    submitSale,
    ...productSelection,
  });
}
