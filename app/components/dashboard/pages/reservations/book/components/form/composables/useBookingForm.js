import { productApi } from "~/services/product";
import { PaymentMethod } from "~/enums/paymentMethod";
import { useAuth } from "~/composables/useAuth";
import { useBookingProducts } from "./useBookingProducts";
import { useBookingSubmit } from "./useBookingSubmit";

/**
 * Orchestrates BookingForm state: role, filters, student, hydration, and submit.
 */
export function useBookingForm(props, emit) {
  const { isCustomerService, branchId: employeeBranchId } = useAuth();

  const hydratingInitial = ref(false);
  const selectedStudent = ref(null);
  const formKey = ref(0);

  const paymentExclude = computed(() =>
    isCustomerService.value ? [PaymentMethod.CASH] : [],
  );

  const defaultPaymentMethod = computed(() =>
    isCustomerService.value ? PaymentMethod.INSTAPAY : PaymentMethod.CASH,
  );

  const form = reactive({
    studentName: "",
    studentPhone: "",
    branchId: null,
    studyYearId: null,
    teacherId: null,
    productType: null,
    productId: null,
    amount: null,
    paymentMethod: defaultPaymentMethod.value,
  });

  const formInitialValues = computed(() => ({
    studentId: null,
    studentName: "",
    studentPhone: "",
    branchId: null,
    studyYearId: null,
    teacherId: null,
    productType: null,
    productId: null,
    amount: null,
    paymentMethod: defaultPaymentMethod.value,
  }));

  const resolvedBranchId = computed(() =>
    isCustomerService.value ? form.branchId : employeeBranchId.value,
  );

  const products = useBookingProducts({
    form,
    props,
    resolvedBranchId,
    isCustomerService,
  });

  const submit = useBookingSubmit({
    form,
    props,
    isCustomerService,
    selectedStudent,
    selectedProductOption: products.selectedProductOption,
    validateDepositAmount: products.validateDepositAmount,
    amountError: products.amountError,
  });

  const resetForm = () => {
    Object.assign(form, {
      studentName: "",
      studentPhone: "",
      branchId: null,
      studyYearId: null,
      teacherId: null,
      productType: null,
      productId: null,
      amount: null,
      paymentMethod: defaultPaymentMethod.value,
    });
    selectedStudent.value = null;
    products.clearProductSelection();
    products.amountError.value = "";
    submit.proofFile.value = null;
    submit.proofKey.value = "";
    submit.proofPreviewUrl.value = "";
    submit.proofRequiredError.value = false;
    submit.paymentFieldsRef.value?.reset?.();
    formKey.value += 1;
  };

  const closeSuccessDialog = () => {
    submit.closeSuccessDialog();
    resetForm();
  };

  const setHydrating = (value) => {
    hydratingInitial.value = Boolean(value);
    emit("hydrating", hydratingInitial.value);
  };

  const hydrateFromInitialSelection = async () => {
    const selection = props.initialSelection;
    if (!selection?.productId) return;

    setHydrating(true);
    try {
      if (selection.branchId) {
        form.branchId = selection.branchId;
      }
      form.studyYearId = selection.studyYearId || null;
      form.teacherId = selection.teacherId || null;
      form.productType = String(selection.type || "").toUpperCase() || null;
      form.productId = selection.productId;

      if (products.canSelectProduct.value) {
        await products.loadProducts();
      }
    } finally {
      setHydrating(false);
    }
  };

  const hydrateFromInitialProduct = async () => {
    if (props.initialSelection?.productId) {
      await hydrateFromInitialSelection();
      return;
    }
    if (!props.initialProduct) return;

    setHydrating(true);
    try {
      const product = await productApi.getProduct(
        String(props.initialProduct),
      );
      if (!product) return;

      form.studyYearId = product.studyYear?.id || null;
      form.teacherId = product.teacher?.id || null;
      form.productType = String(product.type || "").toUpperCase() || null;
      form.productId = product.id || props.initialProduct;

      if (products.canSelectProduct.value) {
        await products.loadProducts();
      }
    } catch {
      // Keep manual filter flow if product details cannot be loaded.
    } finally {
      setHydrating(false);
    }
  };

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
    if (studentStudyYearId && !form.studyYearId) {
      form.studyYearId = studentStudyYearId;
      setFieldValue?.("studyYearId", studentStudyYearId);
      products.onStudyYearChange(studentStudyYearId);
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

  watch(
    () => form.productId,
    () => {
      products.amountError.value = "";
      if (
        form.amount != null &&
        products.productDepositCap.value > 0 &&
        Number(form.amount) > products.productDepositCap.value
      ) {
        form.amount = products.productDepositCap.value;
      }
    },
  );

  watch(
    () => form.amount,
    () => {
      if (form.productId && products.productDepositCap.value > 0) {
        products.validateDepositAmount();
      } else {
        products.amountError.value = "";
      }
    },
  );

  watch(
    () => props.initialProduct,
    async (value) => {
      if (props.initialSelection?.productId) return;
      if (value) await hydrateFromInitialProduct();
    },
  );

  watch(
    () => props.initialSelection,
    async (value) => {
      if (value?.productId) await hydrateFromInitialSelection();
    },
    { deep: true },
  );

  watch(isCustomerService, async (value) => {
    if (value && form.paymentMethod === PaymentMethod.CASH) {
      form.paymentMethod = defaultPaymentMethod.value;
    }
    if (!value) {
      form.branchId = null;
    }
    if (products.canSelectProduct.value) {
      await products.loadProducts();
    }
  });

  onMounted(async () => {
    try {
      if (isCustomerService.value && form.paymentMethod === PaymentMethod.CASH) {
        form.paymentMethod = defaultPaymentMethod.value;
      }
      if (props.initialSelection?.productId || props.initialProduct) {
        await hydrateFromInitialProduct();
      }
    } catch (error) {
      submit.showError(error?.message || "تعذر تحميل بيانات الحجز.");
    }
  });

  return {
    isCustomerService,
    hydratingInitial,
    selectedStudent,
    paymentExclude,
    form,
    formInitialValues,
    formKey,
    ...products,
    ...submit,
    closeSuccessDialog,
    validateStudentSelection,
    applyStudent,
    clearStudent,
  };
}
