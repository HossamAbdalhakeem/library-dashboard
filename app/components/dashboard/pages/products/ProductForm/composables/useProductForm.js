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

export function useProductForm(props, emit) {
  const { showError } = useAppToast();
  const { academicYearId: currentAcademicYearId } = useAcademicYearId();

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
