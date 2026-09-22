import { exchangeService } from "~/services/exchangeService";
import { useAppToast } from "~/composables/useAppToast";
import { PaymentMethod } from "~/utils/paymentMethods";
import {
  buildExchangePayload,
  buildPriceComparisonUi,
  buildSelectedNewProduct,
  canConfirmExchangeState,
  clampExchangeQuantity,
  createExchangeFieldDefaults,
  getQuantityError,
  validateExchangeRequest,
} from "./exchangeFlowHelpers";

export function useSalesExchangeExchangeFlow(props, emit) {
  const { showError, showSuccess } = useAppToast();

  const busy = ref(false);
  const previewLoading = ref(false);
  const confirmVisible = ref(false);
  const newProductId = ref(null);
  const exchangeQuantity = ref(1);
  const quantityError = ref("");
  const preview = ref(null);
  const exchangeError = ref("");
  const exchangePaymentError = ref("");
  const exchangePaymentMethod = ref(PaymentMethod.CASH);
  const exchangeRefundMethod = ref(PaymentMethod.CASH);
  const exchangeImage = ref(null);
  const exchangeProofKey = ref("");

  let previewRequestId = 0;

  const detailVisible = computed({
    get: () => props.open,
    set: (value) => emit("update:open", value),
  });

  const maxQuantity = computed(() =>
    Math.max(1, Number(props.sale?.quantity?.remaining || 1)),
  );

  const selectedNewProduct = computed(() =>
    buildSelectedNewProduct(preview.value),
  );

  const canConfirmExchange = computed(() =>
    canConfirmExchangeState({
      sale: props.sale,
      busy: busy.value,
      previewLoading: previewLoading.value,
      newProductId: newProductId.value,
      preview: preview.value,
      exchangeQuantity: exchangeQuantity.value,
      maxQuantity: maxQuantity.value,
      selectedNewProduct: selectedNewProduct.value,
      exchangePaymentMethod: exchangePaymentMethod.value,
      exchangeRefundMethod: exchangeRefundMethod.value,
      exchangeProofKey: exchangeProofKey.value,
    }),
  );

  const priceComparisonUi = computed(() =>
    buildPriceComparisonUi(preview.value),
  );

  const validateQuantity = () => {
    const error = getQuantityError(
      exchangeQuantity.value,
      maxQuantity.value,
    );
    quantityError.value = error;
    return !error;
  };

  const resetFields = () => {
    const defaults = createExchangeFieldDefaults(maxQuantity.value);
    newProductId.value = defaults.newProductId;
    exchangeQuantity.value = defaults.exchangeQuantity;
    quantityError.value = defaults.quantityError;
    preview.value = defaults.preview;
    exchangeError.value = defaults.exchangeError;
    exchangePaymentError.value = defaults.exchangePaymentError;
    exchangePaymentMethod.value = defaults.exchangePaymentMethod;
    exchangeRefundMethod.value = defaults.exchangeRefundMethod;
    exchangeImage.value = defaults.exchangeImage;
    exchangeProofKey.value = defaults.exchangeProofKey;
    confirmVisible.value = defaults.confirmVisible;
    previewLoading.value = defaults.previewLoading;
  };

  const close = () => {
    if (busy.value) return;
    detailVisible.value = false;
    resetFields();
    emit("close");
  };

  const onDetailVisible = (value) => {
    if (!value) close();
    else detailVisible.value = true;
  };

  const loadPreview = async (productId, quantity) => {
    if (!props.sale?.saleId || !props.sale?.saleItemId || !productId) {
      preview.value = null;
      return;
    }

    const qty = clampExchangeQuantity(quantity, maxQuantity.value);
    const requestId = ++previewRequestId;
    previewLoading.value = true;
    exchangeError.value = "";
    try {
      const result = await exchangeService.previewExchange({
        saleId: props.sale.saleId,
        saleItemId: props.sale.saleItemId,
        newProductId: productId,
        quantity: qty,
      });
      if (requestId !== previewRequestId) return;
      preview.value = result;
    } catch (error) {
      if (requestId !== previewRequestId) return;
      preview.value = null;
      exchangeError.value = error?.message || "تعذر حساب فرق السعر.";
    } finally {
      if (requestId === previewRequestId) previewLoading.value = false;
    }
  };

  const onNewProductId = (value) => {
    newProductId.value = value;
    exchangePaymentError.value = "";
    if (!value) {
      preview.value = null;
      exchangeError.value = "";
      return;
    }
    if (!validateQuantity()) {
      preview.value = null;
      return;
    }
    loadPreview(value, exchangeQuantity.value);
  };

  const onExchangeQuantity = (value) => {
    exchangeQuantity.value = clampExchangeQuantity(
      value,
      maxQuantity.value,
    );
    quantityError.value = "";
    exchangePaymentError.value = "";
    if (!newProductId.value) return;
    if (!validateQuantity()) {
      preview.value = null;
      return;
    }
    loadPreview(newProductId.value, exchangeQuantity.value);
  };

  const requestConfirm = () => {
    exchangeError.value = "";
    exchangePaymentError.value = "";

    const result = validateExchangeRequest({
      sale: props.sale,
      newProductId: newProductId.value,
      preview: preview.value,
      exchangeQuantity: exchangeQuantity.value,
      maxQuantity: maxQuantity.value,
      exchangePaymentMethod: exchangePaymentMethod.value,
      exchangeRefundMethod: exchangeRefundMethod.value,
      exchangeProofKey: exchangeProofKey.value,
    });

    if (!result.ok) {
      if (result.quantityError) quantityError.value = result.quantityError;
      if (result.exchangeError) exchangeError.value = result.exchangeError;
      if (result.exchangePaymentError) {
        exchangePaymentError.value = result.exchangePaymentError;
      }
      return;
    }

    confirmVisible.value = true;
  };

  const confirm = async () => {
    if (!props.sale?.saleId || !props.sale?.saleItemId || !newProductId.value) {
      return;
    }
    if (!validateQuantity()) return;

    busy.value = true;
    try {
      const payload = buildExchangePayload({
        sale: props.sale,
        newProductId: newProductId.value,
        exchangeQuantity: exchangeQuantity.value,
        maxQuantity: maxQuantity.value,
        preview: preview.value,
        exchangePaymentMethod: exchangePaymentMethod.value,
        exchangeRefundMethod: exchangeRefundMethod.value,
        exchangeProofKey: exchangeProofKey.value,
      });

      await exchangeService.createExchange(payload);
      confirmVisible.value = false;
      detailVisible.value = false;
      resetFields();
      showSuccess("تم استبدال المنتج بنجاح.");
      emit("done");
    } catch (error) {
      showError(error?.message || "تعذر تنفيذ الاستبدال.");
    } finally {
      busy.value = false;
    }
  };

  watch(
    () => props.open,
    (open) => {
      if (open) resetFields();
    },
  );

  watch(
    () => props.sale?.quantity?.remaining,
    () => {
      if (props.open) {
        exchangeQuantity.value = maxQuantity.value;
      }
    },
  );

  return {
    busy,
    previewLoading,
    confirmVisible,
    newProductId,
    exchangeQuantity,
    quantityError,
    exchangeError,
    exchangePaymentError,
    exchangePaymentMethod,
    exchangeRefundMethod,
    exchangeImage,
    exchangeProofKey,
    detailVisible,
    selectedNewProduct,
    canConfirmExchange,
    priceComparisonUi,
    close,
    onDetailVisible,
    onNewProductId,
    onExchangeQuantity,
    requestConfirm,
    confirm,
  };
}
