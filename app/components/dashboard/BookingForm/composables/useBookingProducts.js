import { inventoryService } from "~/services/inventoryService";
import { mapInventoryProductOption } from "~/utils/productOptions";
import { formatMoney } from "~/utils/format";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

/**
 * Product inventory loading, filtering, and deposit-cap helpers for BookingForm.
 */
export function useBookingProducts({
  form,
  props,
  resolvedBranchId,
  isCustomerService,
}) {
  const loadingProducts = ref(false);
  const inventoryItems = ref([]);
  const amountError = ref("");

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

  return {
    loadingProducts,
    inventoryItems,
    amountError,
    canSelectProduct,
    productSelectHint,
    productOptions,
    selectedProductOption,
    productDisplayPrice,
    productDepositCap,
    validateDepositAmount,
    clearProductSelection,
    loadProducts,
    onProductSearch,
    onBranchChange,
    onStudyYearChange,
    onTeacherChange,
    onProductTypeChange,
  };
}
