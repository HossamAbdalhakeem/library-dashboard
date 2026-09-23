import { productApi } from "~/services/product";
import {
  emptyProductForm,
  mapProductToForm,
  buildProductPayload,
  validateProductForm,
  calcProfitPercentage,
} from "~/services/product";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";
import {
  isProductType,
  productTypeRequiresStudyYear,
} from "~/enums/productType";

export function useProductForm(props, emit) {
  const { showError } = useAppToast();
  const { academicYearId: currentAcademicYearId } = useAcademicYear();

  const saving = ref(false);
  const showTeacherDrawer = ref(false);
  const showStudyYearDrawer = ref(false);
  const teacherSelectRef = ref(null);
  const studyYearSelectRef = ref(null);

  const form = reactive(emptyProductForm());
  const initialValues = reactive(emptyProductForm());
  const formKey = ref(0);

  const isEdit = computed(() => Boolean(props.product?.id));
  const requiresStudyYear = computed(() =>
    productTypeRequiresStudyYear(form.type),
  );
  const teacherQuery = computed(() => {
    const academicYearId =
      form.academicYearId || currentAcademicYearId.value || null;
    return academicYearId ? { academicYearId } : {};
  });
  const teacherCreateAcademicYearId = computed(
    () => form.academicYearId || currentAcademicYearId.value || null,
  );
  const profitPercentage = computed(() =>
    calcProfitPercentage(form.purchasePrice, form.sellingPrice),
  );

  const applyProduct = (product) => {
    const next = mapProductToForm(product, currentAcademicYearId.value || "");
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

  const bindTeacherSelectRef = (el) => {
    teacherSelectRef.value = el;
  };

  const bindStudyYearSelectRef = (el) => {
    studyYearSelectRef.value = el;
  };

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

  const submit = async () => {
    saving.value = true;

    try {
      const validationError = validateProductForm(form, {
        isEdit: isEdit.value,
        currentAcademicYearId: currentAcademicYearId.value,
      });
      if (validationError) throw new Error(validationError);

      const payload = buildProductPayload(form, {
        isEdit: isEdit.value,
        currentAcademicYearId: currentAcademicYearId.value,
      });

      const result = isEdit.value
        ? await productApi.updateProduct(props.product.id, payload)
        : await productApi.createProduct(payload);

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

  return {
    saving,
    showTeacherDrawer,
    showStudyYearDrawer,
    form,
    initialValues,
    formKey,
    isEdit,
    requiresStudyYear,
    teacherQuery,
    teacherCreateAcademicYearId,
    profitPercentage,
    bindTeacherSelectRef,
    bindStudyYearSelectRef,
    onTeachersLoaded,
    openTeacherDialog,
    openStudyYearDrawer,
    onTeacherSaved,
    onStudyYearSaved,
    submit,
  };
}
