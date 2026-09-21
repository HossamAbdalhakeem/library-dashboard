<template>
  <div class="space-y-4" dir="rtl">
    <Form
      v-slot="{ errors: fieldErrors, meta }"
      :key="formKey"
      :initial-values="initialValues"
      class="grid gap-4"
      @submit="submit"
    >
      <Field v-slot="{ field, errorMessage }" name="type" rules="required">
        <AppGlobalSelectProductType
          :model-value="form.type"
          label="نوع المنتج"
          placeholder="اختر النوع ▾"
          :invalid="!!(errorMessage || fieldErrors.type)"
          @update:model-value="
            (value) => {
              form.type = value;
              field.onChange(value);
            }
          "
        />
        <ErrorMessage name="type" class="text-xs text-red-400" />
      </Field>

      <Field
        v-if="requiresStudyYear"
        v-slot="{ errorMessage, handleChange }"
        v-model="form.studyYearId"
        name="studyYearId"
        rules="required"
      >
        <div class="flex flex-col gap-2 text-right">
          <div class="flex items-end gap-2">
            <AppGlobalSelectStudyYear
              ref="studyYearSelectRef"
              :model-value="form.studyYearId || null"
              label="السنة الدراسية"
              placeholder="اختر السنة الدراسية ▾"
              wrapper-class="min-w-0 flex-1"
              :invalid="!!(errorMessage || fieldErrors.studyYearId)"
              @update:model-value="
                (value) => {
                  form.studyYearId = value || '';
                  handleChange(value || '');
                }
              "
            />
            <Button
              type="button"
              icon="pi pi-plus"
              severity="primary"
              outlined
              class="mb-0.5"
              aria-label="إضافة سنة دراسية"
              @click="openStudyYearDrawer"
            />
          </div>
          <ErrorMessage name="studyYearId" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-slot="{ errorMessage }"
        v-model="form.teacherId"
        name="teacherId"
        rules="required"
      >
        <div class="flex flex-col gap-2 text-right">
          <div class="flex items-end gap-2">
            <AppGlobalSelectTeacher
              ref="teacherSelectRef"
              v-model="form.teacherId"
              label="اختر المدرس"
              placeholder="اختر المدرس ▾"
              wrapper-class="min-w-0 flex-1"
              :query="teacherQuery"
              :invalid="!!(errorMessage || fieldErrors.teacherId)"
              @loaded="onTeachersLoaded"
            />
            <Button
              type="button"
              icon="pi pi-plus"
              severity="primary"
              outlined
              class="mb-0.5"
              aria-label="إضافة مدرس"
              @click="openTeacherDialog"
            />
          </div>
          <ErrorMessage name="teacherId" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field v-slot="{ field, errorMessage }" name="name" rules="required">
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">اسم المنتج</label>
          <InputText
            v-bind="field"
            v-model="form.name"
            class="w-full"
            :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
          />
          <ErrorMessage name="name" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-slot="{ errorMessage }"
        v-model="form.purchasePrice"
        name="purchasePrice"
        rules="required|min_value:0.01"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">سعر الشراء / الجملة</label>
          <AppInputNumber
            v-model="form.purchasePrice"
            mode="currency"
            currency="EGP"
            :min="0"
            :min-fraction-digits="2"
            :use-grouping="true"
            :invalid="!!(errorMessage || fieldErrors.purchasePrice)"
          />
          <ErrorMessage name="purchasePrice" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-slot="{ errorMessage }"
        v-model="form.sellingPrice"
        name="sellingPrice"
        rules="required|min_value:0.01"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">سعر البيع</label>
          <AppInputNumber
            v-model="form.sellingPrice"
            mode="currency"
            currency="EGP"
            :min="0"
            :min-fraction-digits="2"
            :use-grouping="true"
            :invalid="!!(errorMessage || fieldErrors.sellingPrice)"
          />
          <ErrorMessage name="sellingPrice" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-slot="{ errorMessage }"
        v-model="form.minStockQuantity"
        name="minStockQuantity"
        label="حد تنبيه المخزون"
        rules="min_value:0"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">حد تنبيه المخزون</label>
          <AppInputNumber
            v-model="form.minStockQuantity"
            :min="0"
            :min-fraction-digits="0"
            :max-fraction-digits="0"
            :use-grouping="false"
            :invalid="!!(errorMessage || fieldErrors.minStockQuantity)"
          />
          <p class="text-xs text-slate-500">
            عند وصول كمية المخزون لهذا الرقم أو أقل، سيتم إرسال تنبيه بنقص المخزون.
          </p>
          <ErrorMessage name="minStockQuantity" class="text-xs text-red-400" />
        </div>
      </Field>

      <div class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 text-right">
        نسبة الربح المحسوبة:
        <span class="font-semibold text-slate-900">{{ profitPercentage }}%</span>
      </div>

      <div class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
        <div class="text-right">
          <p class="text-sm font-medium text-slate-800">السماح بالحجز</p>
          <p class="text-xs text-slate-500">تفعيل إمكانية حجز هذا المنتج</p>
        </div>
        <ToggleSwitch v-model="form.reservationAllowed" />
      </div>

      <Field
        v-if="form.reservationAllowed"
        v-slot="{ errorMessage }"
        v-model="form.reservationPrice"
        name="reservationPrice"
        rules="min_value:0.01"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">سعر الحجز (اختياري)</label>
          <AppInputNumber
            v-model="form.reservationPrice"
            mode="currency"
            currency="EGP"
            :min="0"
            :min-fraction-digits="2"
            :use-grouping="true"
            :invalid="!!(errorMessage || fieldErrors.reservationPrice)"
          />
          <ErrorMessage name="reservationPrice" class="text-xs text-red-400" />
        </div>
      </Field>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
        <FormSubmitButton
          :label="isEdit ? 'تحديث المنتج' : 'حفظ المنتج'"
          :loading="saving"
          :valid="meta.valid"
        />
      </div>
    </Form>

    <Drawer
      v-model:visible="showTeacherDrawer"
      header="إضافة مدرس"
      position="right"
      class="!w-[400px] max-w-[400px]"
      :style="{ width: '400px' }"
      :block-scroll="true"
      dir="rtl"
    >
      <TeacherForm
        v-if="showTeacherDrawer"
        :locked-academic-year-id="teacherCreateAcademicYearId"
        @saved="onTeacherSaved"
        @cancel="showTeacherDrawer = false"
      />
    </Drawer>

    <Drawer
      v-model:visible="showStudyYearDrawer"
      header="إضافة سنة دراسية"
      position="right"
      class="!w-[400px] max-w-[400px]"
      :style="{ width: '400px' }"
      :block-scroll="true"
      dir="rtl"
    >
      <StudyYearForm
        v-if="showStudyYearDrawer"
        @saved="onStudyYearSaved"
        @cancel="showStudyYearDrawer = false"
      />
    </Drawer>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/app-global-select-study-year/index.vue";
import AppGlobalSelectProductType from "~/components/shared/app-global-select-product-type/index.vue";
import InputText from "primevue/inputtext";
import Drawer from "primevue/drawer";
import ToggleSwitch from "primevue/toggleswitch";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { productService } from "~/services/productService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import {
  ProductType,
  isBookletProduct,
  isCardProduct,
  isProductType,
  normalizeProductType,
  productTypeRequiresStudyYear,
} from "~/enums/productType";

const TeacherForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/teachers/TeacherForm.vue"),
);
const StudyYearForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/study-years/StudyYearForm.vue"),
);

const { showError } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();

const props = defineProps({
  product: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const showTeacherDrawer = ref(false);
const showStudyYearDrawer = ref(false);
const teacherSelectRef = ref(null);
const studyYearSelectRef = ref(null);

const emptyForm = () => ({
  type: ProductType.BOOK,
  teacherId: "",
  studyYearId: "",
  academicYearId: "",
  name: "",
  purchasePrice: null,
  sellingPrice: null,
  minStockQuantity: null,
  reservationAllowed: false,
  reservationPrice: null,
});

const form = reactive(emptyForm());
const initialValues = reactive(emptyForm());
const formKey = ref(0);

const isEdit = computed(() => Boolean(props.product?.id));
const requiresStudyYear = computed(() => productTypeRequiresStudyYear(form.type));
const teacherQuery = computed(() => {
  const academicYearId =
    form.academicYearId || currentAcademicYearId.value || null;
  return academicYearId ? { academicYearId } : {};
});
const teacherCreateAcademicYearId = computed(
  () => form.academicYearId || currentAcademicYearId.value || null,
);
const profitPercentage = computed(() => {
  const purchase = Number(form.purchasePrice || 0);
  const selling = Number(form.sellingPrice || 0);
  if (!purchase || purchase <= 0) return "0.00";
  return (((selling - purchase) / purchase) * 100).toFixed(2);
});

const toNumber = (value) => {
  if (value == null || value === "") return null;
  return Number(value);
};

const applyProduct = (product) => {
  const next = {
    type: normalizeProductType(product?.type),
    teacherId: product?.teacherId || product?.teacher?.id || "",
    studyYearId: product?.studyYearId || product?.studyYear?.id || "",
    academicYearId:
      product?.academicYearId ||
      product?.academicYear?.id ||
      currentAcademicYearId.value ||
      "",
    name: product?.name || "",
    purchasePrice: toNumber(product?.purchasePrice),
    sellingPrice: toNumber(product?.sellingPrice),
    minStockQuantity: toNumber(
      product?.minStockQuantity ?? product?.min_stock_quantity,
    ),
    reservationAllowed: Boolean(product?.reservationAllowed),
    reservationPrice: toNumber(product?.reservationPrice),
  };

  Object.assign(form, next);
  Object.assign(initialValues, next);
  formKey.value += 1;
};

watch(
  () => props.product,
  (product) => {
    applyProduct(product);
  },
  { immediate: true },
);

watch(
  () => form.type,
  (type) => {
    if (!isProductType(type)) form.studyYearId = "";
  },
);

watch(
  () => form.reservationAllowed,
  (allowed) => {
    if (!allowed) form.reservationPrice = null;
  },
);

const onTeachersLoaded = (options) => {
  // Keep existing product teacher on edit even if filtered out (e.g. INACTIVE).
  if (isEdit.value || !form.teacherId) return;
  const stillValid = (options || []).some(
    (option) => String(option.value) === String(form.teacherId),
  );
  if (!stillValid) form.teacherId = "";
};

const openTeacherDialog = () => {
  if (!teacherCreateAcademicYearId.value) {
    showError("اختر العام الدراسي أولاً.");
    return;
  }
  showStudyYearDrawer.value = false;
  showTeacherDrawer.value = true;
};

const openStudyYearDrawer = () => {
  showTeacherDrawer.value = false;
  showStudyYearDrawer.value = true;
};

const onTeacherSaved = async (created) => {
  if (!created?.id) {
    showError("تعذر إنشاء المدرس.");
    return;
  }

  teacherSelectRef.value?.prependOption?.({
    label: created.name || "-",
    value: created.id,
  });
  form.teacherId = created.id;
  teacherSelectRef.value?.reload?.();
  showTeacherDrawer.value = false;
};

const onStudyYearSaved = (created) => {
  if (!created?.id) {
    showError("تعذر إنشاء السنة الدراسية.");
    return;
  }

  studyYearSelectRef.value?.prependOption?.({
    label: created.name || "-",
    value: created.id,
  });
  form.studyYearId = created.id;
  showStudyYearDrawer.value = false;
};

const buildPayload = () => {
  const payload = {
    type: form.type,
    teacherId: form.teacherId,
    name: form.name.trim(),
    purchasePrice: form.purchasePrice,
    sellingPrice: form.sellingPrice,
    profitPercentage: Number(profitPercentage.value),
    reservationAllowed: form.reservationAllowed,
    minStockQuantity:
      form.minStockQuantity == null ? null : Number(form.minStockQuantity),
  };

  // Create: always send selected / current academic year.
  // Edit: do not change academic year (historical lock on backend).
  if (!isEdit.value) {
    const academicYearId =
      form.academicYearId || currentAcademicYearId.value || null;
    if (academicYearId) payload.academicYearId = academicYearId;
  }

  // CARD always requires study year on create/update; BOOK/BOOKLET keep it when set.
  if (isCardProduct(form.type) || form.studyYearId) {
    payload.studyYearId = form.studyYearId || null;
  } else if (isEdit.value) {
    payload.studyYearId = null;
  }

  if (form.reservationAllowed && form.reservationPrice != null) {
    payload.reservationPrice = form.reservationPrice;
  } else if (isEdit.value) {
    payload.reservationPrice = null;
  }

  return payload;
};

const submit = async () => {
  saving.value = true;

  try {
    if (productTypeRequiresStudyYear(form.type) && !form.studyYearId) {
      if (isCardProduct(form.type)) {
        throw new Error("السنة الدراسية مطلوبة عند إنشاء كارت.");
      }
      if (isBookletProduct(form.type)) {
        throw new Error("السنة الدراسية مطلوبة للملزمة.");
      }
      throw new Error("السنة الدراسية مطلوبة للكتب.");
    }

    if (!isEdit.value && !form.academicYearId && !currentAcademicYearId.value) {
      throw new Error("اختر العام الدراسي أولاً.");
    }

    const payload = buildPayload();

    if (isCardProduct(form.type) && !payload.studyYearId) {
      throw new Error("السنة الدراسية مطلوبة عند إنشاء كارت.");
    }

    const result = isEdit.value
      ? await productService.updateProduct(props.product.id, payload)
      : await productService.createProduct(payload);

    emit("saved", result);
  } catch (error) {
    const message = error?.message || "";
    if (
      /not assigned to this academic year/i.test(message) ||
      /Teacher is not assigned/i.test(message)
    ) {
      showError("المدرس غير مرتبط بهذا العام الدراسي.");
    } else {
      showError(message || "تعذر حفظ المنتج.");
    }
  } finally {
    saving.value = false;
  }
};
</script>
