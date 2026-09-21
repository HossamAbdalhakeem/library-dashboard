<template>
  <div class="relative space-y-4" dir="rtl">
    <div
      v-if="hydratingInitial"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-950/55 backdrop-blur-[1px]"
    >
      <i
        class="pi pi-spin pi-spinner text-3xl"
        :class="isCustomerService ? 'text-primary-300' : 'text-primary-600'"
      />
      <p
        class="text-sm font-medium"
        :class="isCustomerService ? 'text-slate-200' : 'text-slate-700'"
      >
        جاري تحميل بيانات المنتج…
      </p>
    </div>

    <div
      v-if="showHeader"
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <h2
        class="text-xl font-bold"
        :class="isCustomerService ? 'text-white' : 'text-slate-900'"
      >
        {{ title }}
      </h2>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="header-actions" />
        <NuxtLink
          v-if="backTo"
          :to="backTo"
          class="rounded-xl border px-4 py-2 text-sm transition"
          :class="
            isCustomerService
              ? 'border-white/10 text-slate-300 hover:bg-white/5'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          "
        >
          ← رجوع للكتب
        </NuxtLink>
      </div>
    </div>

    <div class="grid gap-4">
      <Form
        v-slot="{ errors: fieldErrors, setFieldValue, meta }"
        :initial-values="formInitialValues"
        class="grid gap-4 md:grid-cols-2"
        @submit="handleSubmit"
      >
        <Field
          v-slot="{ errorMessage }"
          class="md:col-span-2"
          name="studentId"
          :rules="validateStudentSelection"
        >
          <div class="flex flex-col gap-2 text-right">
            <StudentSearchField
              v-model="selectedStudent"
              :variant="isCustomerService ? 'dark' : 'default'"
              :label-class="
                isCustomerService ? 'text-slate-200' : 'text-slate-700'
              "
              :invalid="!!(errorMessage || fieldErrors.studentId)"
              @select="(student) => applyStudent(student, setFieldValue)"
              @created="(student) => applyStudent(student, setFieldValue)"
              @clear="() => clearStudent(setFieldValue)"
            />
            <ErrorMessage name="studentId" class="text-xs text-red-500" />
          </div>
        </Field>

        <Field
          v-if="isCustomerService"
          v-slot="{ errorMessage }"
          v-model="form.branchId"
          class="md:col-span-2"
          name="branchId"
          label="الفرع"
          rules="required"
        >
          <div class="flex flex-col gap-2 text-right">
            <AppGlobalSelectBranch
              v-model="form.branchId"
              label="اختيار الفرع"
              placeholder="اختر الفرع"
              :invalid="!!(errorMessage || fieldErrors.branchId)"
              @change="onBranchChange"
            />
            <ErrorMessage name="branchId" class="text-xs text-red-500" />
          </div>
        </Field>

        <Field
          v-slot="{ errorMessage }"
          v-model="form.studyYearId"
          name="studyYearId"
          rules="required"
        >
          <div class="flex flex-col gap-2 text-right">
            <AppGlobalSelectStudyYear
              v-model="form.studyYearId"
              label="السنة الدراسية"
              placeholder="اختر السنة الدراسية"
              :label-class="
                isCustomerService ? 'text-slate-200' : 'text-slate-700'
              "
              :invalid="!!(errorMessage || fieldErrors.studyYearId)"
              @change="onStudyYearChange"
            />
            <ErrorMessage name="studyYearId" class="text-xs text-red-500" />
          </div>
        </Field>

        <Field
          v-slot="{ errorMessage }"
          v-model="form.teacherId"
          name="teacherId"
          rules="required"
        >
          <div class="flex flex-col gap-2 text-right">
            <AppGlobalSelectTeacher
              v-model="form.teacherId"
              label="المدرس"
              placeholder="اختر المدرس"
              :disabled="!form.studyYearId"
              :label-class="
                isCustomerService ? 'text-slate-200' : 'text-slate-700'
              "
              :invalid="!!(errorMessage || fieldErrors.teacherId)"
              @change="onTeacherChange"
            />
            <ErrorMessage name="teacherId" class="text-xs text-red-500" />
          </div>
        </Field>

        <Field
          v-slot="{ errorMessage }"
          v-model="form.productType"
          name="productType"
          rules="required"
        >
          <div class="flex flex-col gap-2 text-right">
            <AppGlobalSelectProductType
              v-model="form.productType"
              label="نوع المنتج"
              placeholder="اختر النوع"
              :disabled="!form.teacherId"
              :label-class="
                isCustomerService ? 'text-slate-200' : 'text-slate-700'
              "
              :invalid="!!(errorMessage || fieldErrors.productType)"
              @change="onProductTypeChange"
            />
            <ErrorMessage name="productType" class="text-xs text-red-500" />
          </div>
        </Field>

        <Field
          v-slot="{ errorMessage }"
          v-model="form.productId"
          name="productId"
          label="المنتج"
          rules="required"
        >
          <div class="flex flex-col gap-2 text-right">
            <ProductSelect
              v-model="form.productId"
              :options="productOptions"
              :loading="loadingProducts"
              :disabled="!canSelectProduct"
              :invalid="!!(errorMessage || fieldErrors.productId)"
              :hint="productSelectHint"
              @search="onProductSearch"
            />
            <ErrorMessage name="productId" class="text-xs text-red-500" />
          </div>
        </Field>

        <div
          v-if="selectedProductOption"
          class="md:col-span-2 rounded-2xl px-4 py-5 text-center sm:px-6 sm:py-8"
          :class="
            isCustomerService
              ? 'border border-primary-400/25 bg-black'
              : 'border border-slate-700 bg-black'
          "
        >
          <p
            class="mb-2 text-sm font-medium"
            :class="isCustomerService ? 'text-primary-200/80' : 'text-slate-300'"
          >
            {{ selectedProductOption.priceKindLabel || "مبلغ المنتج" }}
          </p>
          <p
            class="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
            :class="isCustomerService ? 'text-primary-300' : 'text-white'"
          >
            {{ formatMoney(productDisplayPrice, "rtl") }}
          </p>
        </div>

        <Field
          v-slot="{ errorMessage }"
          v-model="form.amount"
          name="amount"
          label="المبلغ المدفوع مقدما"
          rules="required|min_value:1"
        >
          <div class="md:col-span-2 flex flex-col gap-2 text-right">
            <div class="flex items-center justify-between gap-2">
              <label class="text-sm font-medium text-slate-700"
                >المبلغ المدفوع (مقدم)</label
              >
              <span
                v-if="productDepositCap > 0"
                class="text-xs font-medium text-slate-500"
              >
                الحد الأقصى: {{ formatMoney(productDepositCap, "rtl") }}
              </span>
            </div>
            <AppInputNumber
              v-model="form.amount"
              mode="currency"
              currency="EGP"
              :min="1"
              :max="productDepositCap > 0 ? productDepositCap : undefined"
              :min-fraction-digits="2"
              :use-grouping="true"
              :invalid="!!(errorMessage || fieldErrors.amount || amountError)"
            />
            <p v-if="amountError" class="text-xs text-red-500">
              {{ amountError }}
            </p>
            <ErrorMessage name="amount" class="text-xs text-red-500" />
          </div>
        </Field>

        <div class="md:col-span-2">
          <Field
            v-slot="{ errorMessage }"
            v-model="form.paymentMethod"
            name="paymentMethod"
            rules="required"
          >
            <PaymentFields
              ref="paymentFieldsRef"
              v-model:method="form.paymentMethod"
              v-model:image="proofFile"
              v-model:image-data-url="proofKey"
              v-model:image-preview-url="proofPreviewUrl"
              :exclude="paymentExclude"
              :method-invalid="!!errorMessage"
              :method-error="errorMessage || ''"
              :image-invalid="proofRequiredError"
            />
          </Field>
        </div>

        <div class="md:col-span-2 flex justify-center">
          <FormSubmitButton
            :label="submitLabel"
            :loading="saving"
            :valid="meta.valid"
            button-class="min-w-[220px]"
          />
        </div>
      </Form>
    </div>

    <ReservationSuccessDialog
      v-if="successDialogVisible"
      v-model:visible="successDialogVisible"
      :summary="reservationSummary"
      @close="closeSuccessDialog"
    />
  </div>
</template>

<script setup>
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import StudentSearchField from "~/components/shared/student-search-field/index.vue";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/app-global-select-study-year/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/app-global-select-teacher/index.vue";
import AppGlobalSelectProductType from "~/components/shared/app-global-select-product-type/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { inventoryService } from "~/services/inventoryService";
import { productService } from "~/services/productService";
import { mapInventoryProductOption } from "~/utils/productOptions";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import { formatMoney, formatDateTime } from "~/utils/format";
import { useAuthStore } from "~/store/auth";
import { useAppToast } from "~/composables/useAppToast";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

defineOptions({ name: "DashboardBookingForm" });

const ReservationSuccessDialog = defineAsyncComponent(
  () => import("~/components/dashboard/ReservationSuccessDialog.vue"),
);

const RESERVATION_QUANTITY = 1;

const props = defineProps({
  title: { type: String, default: "احجز كتاب" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  /** Prefill from CS product search (product + optional branch). */
  initialSelection: { type: Object, default: null },
  /** API role e.g. CUSTOMER_SERVICE, or dashboard role "social" */
  role: { type: String, default: "" },
  submitFn: { type: Function, required: true },
});

const { showError } = useAppToast();
const authStore = useAuthStore();
const emit = defineEmits(["hydrating"]);

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

const saving = ref(false);
const loadingProducts = ref(false);
const hydratingInitial = ref(false);
const reservationSummary = ref(null);
const successDialogVisible = ref(false);
const proofFile = ref(null);
const proofKey = ref("");
const proofPreviewUrl = ref("");
const proofRequiredError = ref(false);
const paymentFieldsRef = ref(null);
const selectedStudent = ref(null);
const inventoryItems = ref([]);
const amountError = ref("");

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

const canSelectProduct = computed(
  () =>
    Boolean(
      resolvedBranchId.value &&
        form.studyYearId &&
        form.teacherId &&
        form.productType,
    ),
);

const productSelectHint = computed(() => {
  if (!resolvedBranchId.value) {
    return isCustomerService.value
      ? "اختر الفرع أولاً لعرض منتجات الحجز."
      : "لا يوجد فرع مرتبط بالمستخدم الحالي.";
  }
  if (!form.studyYearId) return "اختر السنة الدراسية أولاً.";
  if (!form.teacherId) return "اختر المدرس أولاً.";
  if (!form.productType) return "اختر نوع المنتج أولاً.";
  return "";
});

const matchesProductFilters = (option) => {
  if (
    form.studyYearId &&
    String(option.studyYearId || "") !== String(form.studyYearId)
  ) {
    return false;
  }
  if (
    form.teacherId &&
    String(option.teacherId || "") !== String(form.teacherId)
  ) {
    return false;
  }
  if (
    form.productType &&
    String(option.type || "").toUpperCase() !==
      String(form.productType).toUpperCase()
  ) {
    return false;
  }
  return true;
};

const productOptions = computed(() =>
  inventoryItems.value
    .map(mapInventoryProductOption)
    .filter((option) => option.value && matchesProductFilters(option)),
);

const selectedProductOption = computed(
  () =>
    productOptions.value.find((option) => option.value === form.productId) ||
    null,
);

/** Same amount shown in the product dropdown (selling or initial price) */
const productDisplayPrice = computed(() =>
  Number(selectedProductOption.value?.displayPrice || 0),
);

/** Deposit max = same displayed product price */
const productDepositCap = computed(() => productDisplayPrice.value);

const validateDepositAmount = () => {
  amountError.value = "";
  const paid = Number(form.amount || 0);
  const max = Number(productDepositCap.value || 0);

  if (!form.productId || max <= 0) {
    return true;
  }

  if (paid > max) {
    amountError.value = `لا يمكن دفع أكثر من سعر المنتج (${formatMoney(max, "rtl")}).`;
    return false;
  }

  return true;
};

const clearProductSelection = () => {
  form.productId = null;
  inventoryItems.value = [];
};

const loadProducts = async (search = "") => {
  if (!canSelectProduct.value) {
    inventoryItems.value = [];
    return;
  }

  loadingProducts.value = true;
  try {
    const query = String(search || "").trim();
    const items = await inventoryService.getBranchInventory(
      resolvedBranchId.value,
      {
        forReservation: true,
        studyYearId: form.studyYearId,
        teacherId: form.teacherId,
        type: form.productType,
        ...(query ? { search: query } : {}),
      },
    );
    inventoryItems.value = Array.isArray(items) ? items : items?.data || [];

    const preferredId = form.productId || props.initialProduct || null;
    if (
      preferredId &&
      productOptions.value.some((option) => option.value === preferredId)
    ) {
      form.productId = preferredId;
    } else if (
      form.productId &&
      !productOptions.value.some((option) => option.value === form.productId)
    ) {
      form.productId = null;
    }
  } finally {
    loadingProducts.value = false;
  }
};

const { run: onProductSearch } = useThrottledCallback((term) => {
  loadProducts(term);
}, 400);

const onBranchChange = async (value) => {
  form.branchId = value || null;
  form.productId = null;
  if (canSelectProduct.value) {
    await loadProducts();
  } else {
    inventoryItems.value = [];
  }
};

const onStudyYearChange = (value) => {
  form.studyYearId = value || null;
  form.teacherId = null;
  form.productType = null;
  clearProductSelection();
};

const onTeacherChange = (value) => {
  form.teacherId = value || null;
  form.productType = null;
  clearProductSelection();
};

const onProductTypeChange = async (value) => {
  form.productType = value || null;
  form.productId = null;
  if (!canSelectProduct.value) {
    inventoryItems.value = [];
    return;
  }
  await loadProducts();
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

    if (canSelectProduct.value) {
      await loadProducts();
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
    const product = await productService.getProduct(String(props.initialProduct));
    if (!product) return;

    form.studyYearId =
      product.studyYearId || product.studyYear?.id || product.study_year_id || null;
    form.teacherId =
      product.teacherId || product.teacher?.id || product.teacher_id || null;
    form.productType = String(product.type || "").toUpperCase() || null;
    form.productId = product.id || props.initialProduct;

    if (canSelectProduct.value) {
      await loadProducts();
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
    student.studyYearId || student.studyYear?.id || student.study_year_id || null;
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

const ensureStudent = async () => {
  if (!selectedStudent.value?.id) {
    throw new Error("اختر طالباً من القائمة أو أضف طالباً جديداً.");
  }

  form.studentName = selectedStudent.value.name;
  form.studentPhone = selectedStudent.value.phone;
  return selectedStudent.value.id;
};

const closeSuccessDialog = () => {
  successDialogVisible.value = false;
  reservationSummary.value = null;
};

const handleSubmit = async () => {
  amountError.value = "";
  proofRequiredError.value = false;

  if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) {
    proofRequiredError.value = true;
    return;
  }

  if (!validateDepositAmount()) {
    return;
  }

  saving.value = true;

  try {
    if (isCustomerService.value && !form.branchId) {
      throw new Error("اختيار الفرع مطلوب.");
    }

    const studentId = await ensureStudent();
    const product = selectedProductOption.value;
    const method = form.paymentMethod;
    const needsProof = paymentMethodNeedsProof(method);
    const deposit = Number(form.amount || 0);

    const result = await props.submitFn({
      studentId,
      productId: form.productId,
      quantity: RESERVATION_QUANTITY,
      deposit,
      method,
      ...(form.branchId ? { branchId: form.branchId } : {}),
      ...(needsProof && proofKey.value
        ? { proofReference: proofKey.value }
        : {}),
    });

    if (!result?.id || !result?.reservationNumber) {
      throw new Error("تعذر قراءة بيانات الحجز من الخادم.");
    }

    reservationSummary.value = {
      reservationNumber: result.reservationNumber,
      dateTimeLabel: formatDateTime(result.createdAt),
      productName: product?.name || result.product?.name || "",
      teacherName:
        product?.teacherName || result.product?.teacher?.name || "",
      studyYearName: product?.studyYearName || "",
      studentName: form.studentName || result.student?.name || "-",
      paidAmount: Number(result.payment?.paidAmount ?? result.paidAmount),
      totalAmount: Number(
        result.product?.totalAmount ?? result.totalAmount,
      ),
      methodLabel: PAYMENT_METHOD_LABELS[method] || method,
      proofImage: needsProof ? proofPreviewUrl.value || "" : "",
    };

    successDialogVisible.value = true;
  } catch (error) {
    showError(error?.message || "تعذر تسجيل الحجز.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => form.productId,
  () => {
    amountError.value = "";
    if (
      form.amount != null &&
      productDepositCap.value > 0 &&
      Number(form.amount) > productDepositCap.value
    ) {
      form.amount = productDepositCap.value;
    }
  },
);

watch(
  () => form.amount,
  () => {
    if (form.productId && productDepositCap.value > 0) {
      validateDepositAmount();
    } else {
      amountError.value = "";
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
  if (canSelectProduct.value) {
    await loadProducts();
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
    showError(error?.message || "تعذر تحميل بيانات الحجز.");
  }
});
</script>
