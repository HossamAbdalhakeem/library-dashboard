import {
  saleApi,
  buildSalePayload,
  mapSaleToSuccessSummary,
} from "~/services/sale";
import {
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";
import { feeAmountForRequest } from "~/utils/payment-fee";
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
  const confirmDialogVisible = ref(false);
  const feeEnabled = ref(false);
  const feeAmount = ref(null);
  const saleSummary = ref(null);
  const selectedStudent = ref(null);

  const form = reactive({
    studentName: "",
    studentPhone: "",
    studyYearId: null,
    teacherId: null,
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
    clearProductSelection,
    loadProducts,
    canSelectProduct,
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

    const studentStudyYearId = student.studyYear?.id || null;
    if (studentStudyYearId && form.teacherId && !form.studyYearId) {
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
    resetForm();
  };

  const clearPaymentProof = () => {
    proofFile.value = null;
    proofKey.value = "";
    proofPreviewUrl.value = "";
    proofRequiredError.value = false;
    paymentFieldsRef.value?.reset?.();
  };

  /** Keep student, teacher, year, quantity, and payment method. Clear product and proof. */
  const startAnotherSale = async () => {
    successDialogVisible.value = false;
    saleSummary.value = null;
    clearProductSelection();
    quantityError.value = "";
    clearPaymentProof();
    if (!canSelectProduct.value) return;
    try {
      await loadProducts();
    } catch (error) {
      showError(error?.message || "تعذر تحميل المنتجات.");
    }
  };

  const resetForm = () => {
    Object.assign(form, {
      studentName: "",
      studentPhone: "",
      studyYearId: null,
      teacherId: null,
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
    feeEnabled.value = false;
    feeAmount.value = null;
    confirmDialogVisible.value = false;
    paymentFieldsRef.value?.reset?.();
    formKey.value += 1;
  };

  const flagMissingProof = () => {
    proofRequiredError.value = false;
    if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) {
      proofRequiredError.value = true;
      return true;
    }
    return false;
  };

  const requestSubmit = () => {
    quantityError.value = "";
    if (flagMissingProof()) return;
    if (!validateQuantity()) return;
    confirmDialogVisible.value = true;
  };

  const resolvedFeeAmount = () =>
    feeAmountForRequest({
      method: form.method,
      enabled: feeEnabled.value,
      amount: feeAmount.value,
    });

  const submitSale = async () => {
    quantityError.value = "";

    if (flagMissingProof()) {
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

      const sale = await saleApi.createSale(
        buildSalePayload({
          studentId,
          productId: form.productId,
          quantity: form.quantity,
          method: form.method,
          feeAmount: resolvedFeeAmount(),
          ...(needsProof && proofKey.value
            ? { proofReference: proofKey.value }
            : {}),
        }),
      );

      const summary = mapSaleToSuccessSummary(sale, {
        product,
        studentName: asText(form.studentName, "name") || "-",
        proofImage: proofPreviewUrl.value || "",
        needsProof,
        feeAmount: resolvedFeeAmount(),
      });

      if (!summary) {
        throw new Error("تعذر قراءة بيانات البيع من الخادم.");
      }

      saleSummary.value = summary;
      confirmDialogVisible.value = false;
      successDialogVisible.value = true;
    } catch (error) {
      showError(error?.message || "تعذر تسجيل البيع.");
    } finally {
      saving.value = false;
    }
  };

  // Keep paymentFieldsRef OUT of reactive() — writing it from a template :ref
  // (null on unmount, then el) would re-render forever and balloon memory.
  const setPaymentFieldsRef = (el) => {
    paymentFieldsRef.value = el || null;
  };

  return reactive({
    saving,
    formKey,
    proofFile,
    proofKey,
    proofPreviewUrl,
    proofRequiredError,
    successDialogVisible,
    confirmDialogVisible,
    feeEnabled,
    feeAmount,
    saleSummary,
    selectedStudent,
    form,
    formInitialValues,
    validateStudentSelection,
    applyStudent,
    clearStudent,
    onPaymentChange,
    closeSuccessDialog,
    startAnotherSale,
    resetForm,
    requestSubmit,
    resolvedFeeAmount,
    submitSale,
    flagMissingProof,
    setPaymentFieldsRef,
    ...productSelection,
  });
}
