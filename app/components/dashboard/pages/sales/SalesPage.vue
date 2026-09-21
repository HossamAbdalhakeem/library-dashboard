<template>
  <div class="space-y-6" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">البيع المباشر</span>
      </template>

      <template #content>
        <Form
          v-slot="{ errors: fieldErrors, setFieldValue, meta }"
          :key="formKey"
          :initial-values="formInitialValues"
          class="grid gap-4 md:grid-cols-2"
          @submit="submitSale"
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
                :invalid="!!(errorMessage || fieldErrors.studentId)"
                @select="(student) => applyStudent(student, setFieldValue)"
                @created="(student) => applyStudent(student, setFieldValue)"
                @clear="() => clearStudent(setFieldValue)"
              />
              <ErrorMessage name="studentId" class="text-xs text-red-500" />
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
                placeholder="اختر المنتج"
                :hint="productSelectHint"
                :invalid="!!(errorMessage || fieldErrors.productId)"
                @change="onProductChange"
                @search="onProductSearch"
              />
              <ErrorMessage name="productId" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field
            v-slot="{ errorMessage }"
            v-model="form.quantity"
            name="quantity"
            rules="required|min_value:1"
          >
            <div class="flex flex-col gap-2 text-right">
              <div class="flex items-center justify-between gap-2">
                <label class="text-sm font-medium text-slate-700">الكمية</label>
                <span
                  v-if="selectedProductOption"
                  class="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-semibold text-primary-700"
                >
                  المتاح للبيع: {{ selectedProductOption.availableQuantity }}
                </span>
              </div>
              <AppInputNumber
                v-model="form.quantity"
                :min="1"
                :max="maxQuantity"
                :max-fraction-digits="0"
                :invalid="!!(errorMessage || fieldErrors.quantity || quantityError)"
              />
              <p v-if="quantityError" class="text-xs text-red-500">
                {{ quantityError }}
              </p>
              <ErrorMessage name="quantity" class="text-xs text-red-500" />
            </div>
          </Field>

          <div
            v-if="selectedProductOption"
            class="md:col-span-2 rounded-2xl border border-amber-400/40 bg-gradient-to-l from-amber-500/20 via-orange-500/10 to-slate-900 px-4 py-5 text-center sm:px-6 sm:py-8"
          >
            <p class="mb-2 text-sm font-medium text-amber-100/80">
              مبلغ المنتج
            </p>
            <p
              class="text-3xl font-extrabold tracking-tight text-amber-300 sm:text-4xl md:text-5xl"
            >
              {{ formatMoney(requiredAmount, "rtl") }}
            </p>
          </div>
          <div class="md:col-span-2">
            <Field
              v-slot="{ errorMessage }"
              v-model="form.method"
              name="method"
              rules="required"
            >
              <PaymentFields
                ref="paymentFieldsRef"
                v-model:method="form.method"
                v-model:image="proofFile"
                v-model:image-data-url="proofKey"
                v-model:image-preview-url="proofPreviewUrl"
                :method-invalid="!!(errorMessage || fieldErrors.method)"
                :method-error="errorMessage || ''"
                :image-invalid="proofRequiredError"
                @change="onPaymentChange"
              />
            </Field>
          </div>

          <div class="md:col-span-2 flex justify-center">
            <FormSubmitButton
              label="تأكيد البيع"
              :loading="saving"
              :valid="meta.valid"
              button-class="min-w-[200px]"
            />
          </div>
        </Form>
      </template>
    </Card>

    <Dialog
      v-model:visible="successDialogVisible"
      modal
      dir="rtl"
      :closable="false"
      :dismissableMask="false"
      :closeOnEscape="false"
      :style="{ width: '440px', maxWidth: '95vw' }"
      :pt="{
        header: { class: 'hidden' },
        content: { class: 'pt-6' },
      }"
    >
      <SaleSuccessDialogContent
        v-if="successDialogVisible"
        :sale-summary="saleSummary"
      />

      <template #footer>
        <div class="flex w-full justify-center">
          <Button
            label="إغلاق"
            severity="secondary"
            class="min-w-[120px]"
            @click="closeSuccessDialog"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import StudentSearchField from "~/components/shared/student-search-field/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/app-global-select-study-year/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/app-global-select-teacher/index.vue";
import AppGlobalSelectProductType from "~/components/shared/app-global-select-product-type/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { saleService } from "~/services/saleService";
import { inventoryService } from "~/services/inventoryService";
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

const SaleSuccessDialogContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/manage/SaleSuccessDialogContent.vue"),
);

const authStore = useAuthStore();
const { showError } = useAppToast();
const saving = ref(false);
const loadingProducts = ref(false);
const formKey = ref(0);
const proofFile = ref(null);
const proofKey = ref("");
const proofPreviewUrl = ref("");
const proofRequiredError = ref(false);
const paymentFieldsRef = ref(null);
const quantityError = ref("");
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

const products = ref([]);

const branchId = computed(
  () =>
    authStore.user?.branch_id ||
    authStore.user?.branchId ||
    authStore.user?.branches?.[0]?.id ||
    null,
);

const canSelectProduct = computed(
  () =>
    Boolean(
      branchId.value &&
        form.studyYearId &&
        form.teacherId &&
        form.productType,
    ),
);

const productSelectHint = computed(() => {
  if (!branchId.value) return "لا يوجد فرع مرتبط بالمستخدم الحالي.";
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
  products.value
    .map(mapInventoryProductOption)
    .filter((option) => option.value && matchesProductFilters(option)),
);

const selectedProductOption = computed(
  () =>
    productOptions.value.find((option) => option.value === form.productId) ||
    null,
);

const selectedProduct = computed(() => {
  const row = products.value.find(
    (item) => (item.product?.id || item.productId || item.id) === form.productId,
  );
  return row?.product || row || null;
});

const maxQuantity = computed(() =>
  Math.max(1, Number(selectedProductOption.value?.availableQuantity || 1)),
);

const unitPrice = computed(() =>
  Number(
    selectedProduct.value?.sellingPrice ||
      selectedProductOption.value?.sellingPrice ||
      0,
  ),
);
const requiredAmount = computed(() =>
  Number((unitPrice.value * Number(form.quantity || 0)).toFixed(2)),
);

const validateStudentSelection = (value) => {
  if (value) return true;
  return "اختر طالباً من القائمة أو أضف طالباً جديداً.";
};

const clearProductSelection = () => {
  form.productId = null;
  products.value = [];
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

const loadProducts = async (search = "") => {
  if (!canSelectProduct.value) {
    products.value = [];
    return;
  }

  loadingProducts.value = true;
  try {
    const query = String(search || "").trim();
    const items = await inventoryService.getBranchInventory(branchId.value, {
      availableOnly: true,
      studyYearId: form.studyYearId,
      teacherId: form.teacherId,
      type: form.productType,
      ...(query ? { search: query } : {}),
    });
    products.value = Array.isArray(items) ? items : items?.data || [];

    if (
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
  loadProducts(term).catch((error) => {
    showError(error?.message || "تعذر تحميل المنتجات.");
  });
}, 400);

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
    products.value = [];
    return;
  }
  try {
    await loadProducts();
  } catch (error) {
    showError(error?.message || "تعذر تحميل المنتجات.");
  }
};

const onProductChange = (productId) => {
  quantityError.value = "";
  form.productId = productId;
  const available = productOptions.value.find(
    (option) => option.value === productId,
  )?.availableQuantity;
  if (available != null && Number(form.quantity) > Number(available)) {
    form.quantity = Number(available);
  }
};

const validateQuantity = () => {
  quantityError.value = "";
  const available = Number(selectedProductOption.value?.availableQuantity || 0);
  const qty = Number(form.quantity || 0);

  if (!selectedProductOption.value) {
    return false;
  }

  if (qty < 1) {
    quantityError.value = "الكمية يجب أن تكون 1 على الأقل.";
    return false;
  }

  if (qty > available) {
    quantityError.value = `الكمية المطلوبة أكبر من المتاح (${available}).`;
    return false;
  }

  return true;
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

watch(
  () => form.quantity,
  () => {
    if (selectedProductOption.value) {
      validateQuantity();
    }
  },
);
</script>
