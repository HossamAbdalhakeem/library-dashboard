import { productService } from "~/services/productService";
import { PaymentMethod } from "~/utils/paymentMethods";
import { useAuthStore } from "~/store/auth";
import { useBookingProducts } from "./useBookingProducts";
import { useBookingSubmit } from "./useBookingSubmit";

/**
 * Orchestrates BookingForm state: role, filters, student, hydration, and submit.
 */
export function useBookingForm(props, emit) {
  const authStore = useAuthStore();

  const isCustomerService = computed(() => {
    const role = String(props.role || "").toUpperCase();
    return (
      role === "CUSTOMER_SERVICE" ||
      role === "SOCIAL" ||
      role === "CUSTOMER-SERVICE"
    );
  });

  const employeeBranchId = computed(
    () =>
      authStore.user?.branch_id ||
      authStore.user?.branchId ||
      authStore.user?.branches?.[0]?.id ||
      null,
  );

  const hydratingInitial = ref(false);
  const selectedStudent = ref(null);

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
      const product = await productService.getProduct(
        String(props.initialProduct),
      );
      if (!product) return;

      form.studyYearId =
        product.studyYearId ||
        product.studyYear?.id ||
        product.study_year_id ||
        null;
      form.teacherId =
        product.teacherId || product.teacher?.id || product.teacher_id || null;
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

    const studentStudyYearId =
      student.studyYearId ||
      student.studyYear?.id ||
      student.study_year_id ||
      null;
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
    ...products,
    ...submit,
    validateStudentSelection,
    applyStudent,
    clearStudent,
  };
}
