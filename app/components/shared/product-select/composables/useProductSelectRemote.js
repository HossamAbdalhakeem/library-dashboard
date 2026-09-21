import { inventoryService } from "~/services/inventoryService";
import { productService } from "~/services/productService";
import {
  mapCatalogProductOption,
  mapInventoryProductOptions,
} from "~/utils/productOptions";
import { useAppToast } from "~/composables/useAppToast";

/**
 * Inventory / catalog remote option loaders for ProductSelect.
 */
export function useProductSelectRemote({
  props,
  emit,
  searchTerm,
  internalOptions,
  internalLoading,
  withSelectedOption,
  markRemoteMatch,
}) {
  const { showError } = useAppToast();
  const requestId = ref(0);

  const loadInventoryOptions = async (term = searchTerm.value) => {
    if (!props.branchId) {
      internalOptions.value = [];
      emit("loaded", []);
      return;
    }

    const currentRequest = ++requestId.value;
    internalLoading.value = true;
    emit("loading", true);
    try {
      const query = String(term || "").trim();
      const items = await inventoryService.getBranchInventory(props.branchId, {
        ...(props.inventoryQuery || {}),
        ...(query ? { search: query } : {}),
      });
      if (currentRequest !== requestId.value) return;

      const mapped = markRemoteMatch(
        mapInventoryProductOptions(items, {
          excludeProductId: props.excludeProductId,
          minAvailableQuantity: props.minAvailableQuantity,
        }),
        query,
      );
      const next = withSelectedOption(mapped);
      internalOptions.value = next;
      emit("loaded", next);
    } catch (error) {
      if (currentRequest !== requestId.value) return;
      internalOptions.value = withSelectedOption([]);
      emit("loaded", []);
      showError(error?.message || "تعذر تحميل المنتجات.");
    } finally {
      if (currentRequest === requestId.value) {
        internalLoading.value = false;
        emit("loading", false);
      }
    }
  };

  const loadCatalogOptions = async (term = searchTerm.value) => {
    const currentRequest = ++requestId.value;
    internalLoading.value = true;
    emit("loading", true);
    try {
      const query = String(term || "").trim();
      const params = {
        per_page: props.perPage,
        ...(query ? { search: query } : {}),
        ...(props.reservationOnly ? { reservationAllowed: true } : {}),
      };
      const result = await productService.getProducts(params);
      if (currentRequest !== requestId.value) return;

      const list = result?.data || result || [];
      const mapped = markRemoteMatch(
        list
          .map((product) =>
            mapCatalogProductOption(product, {
              reservationOnly: props.reservationOnly,
            }),
          )
          .filter(Boolean)
          .filter(
            (option) =>
              !props.excludeProductId || option.value !== props.excludeProductId,
          ),
        query,
      );
      const next = withSelectedOption(mapped);
      internalOptions.value = next;
      emit("loaded", next);
    } catch (error) {
      if (currentRequest !== requestId.value) return;
      internalOptions.value = withSelectedOption([]);
      emit("loaded", []);
      showError(error?.message || "تعذر تحميل المنتجات.");
    } finally {
      if (currentRequest === requestId.value) {
        internalLoading.value = false;
        emit("loading", false);
      }
    }
  };

  const reload = async (term = searchTerm.value) => {
    if (props.source === "inventory") {
      await loadInventoryOptions(term);
      return;
    }
    if (props.source === "catalog") {
      await loadCatalogOptions(term);
    }
  };

  return {
    reload,
    loadInventoryOptions,
    loadCatalogOptions,
  };
}
