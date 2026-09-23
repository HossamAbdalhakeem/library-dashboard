import { useDebouncedCallback } from "~/composables/useDebouncedCallback";
import { useProductSelectRemote } from "./useProductSelectRemote";

/**
 * Product select state, filtering, selection, and remote/local search wiring.
 */
export function useProductSelect(props, emit) {
  const internalOptions = ref([]);
  const internalLoading = ref(false);
  const searchTerm = ref("");
  const selectedOptionCache = ref(null);

  const isLoading = computed(() => props.loading || internalLoading.value);

  const optionLabelKey = computed(() => (props.nameOnly ? "name" : "label"));

  const usesRemoteSearch = computed(
    () => props.source === "catalog" || props.source === "inventory",
  );

  const canSelect = computed(() => {
    if (props.source === "inventory") return Boolean(props.branchId);
    return true;
  });

  const activeFilterFields = computed(() => {
    // While searching (own API or parent @search), skip local re-filter.
    if (searchTerm.value) return ["_remoteMatch"];
    return props.filterFields;
  });

  const markRemoteMatch = (options, term) => {
    const q = String(term || "").trim();
    if (!q) return options;
    return options.map((option) => ({
      ...option,
      _remoteMatch: q,
    }));
  };

  const resolvedOptions = computed(() => {
    const list =
      props.source === "options" || props.options != null
        ? props.options || []
        : internalOptions.value;
    return markRemoteMatch(list, searchTerm.value);
  });

  const selectedOption = computed(() => {
    const fromList =
      resolvedOptions.value.find((option) => option.value === props.modelValue) ||
      null;
    if (fromList) return fromList;
    if (
      selectedOptionCache.value &&
      selectedOptionCache.value.value === props.modelValue
    ) {
      return selectedOptionCache.value;
    }
    return null;
  });

  const withSelectedOption = (options) => {
    const list = Array.isArray(options) ? [...options] : [];
    const selected = selectedOption.value;
    if (!selected?.value) return list;
    if (list.some((item) => item.value === selected.value)) return list;
    return [selected, ...list];
  };

  const { reload } = useProductSelectRemote({
    props,
    emit,
    searchTerm,
    internalOptions,
    internalLoading,
    withSelectedOption,
    markRemoteMatch,
  });

  const onUpdate = (value) => {
    emit("update:modelValue", value);
    const option =
      resolvedOptions.value.find((item) => item.value === value) ||
      (selectedOptionCache.value?.value === value
        ? selectedOptionCache.value
        : null);
    if (option) selectedOptionCache.value = option;
    emit("select", option);
    emit("change", value, option);
  };

  const { run: runSearch, cancel: cancelSearch } = useDebouncedCallback(
    (term) => {
      // Notify parent (e.g. BookingForm with :options) and remote sources.
      emit("search", term);
      if (usesRemoteSearch.value) {
        reload(term);
      }
    },
    props.throttleMs,
  );

  const onFilter = (event) => {
    const term = String(event?.value ?? "").trim();
    searchTerm.value = term;

    // Clear immediately so the full list comes back without waiting.
    if (!term) {
      cancelSearch();
      emit("search", "");
      if (usesRemoteSearch.value) {
        reload("");
      }
      return;
    }

    runSearch(term);
  };

  watch(
    () => props.modelValue,
    (value) => {
      if (!value) {
        selectedOptionCache.value = null;
        return;
      }
      const option =
        resolvedOptions.value.find((item) => item.value === value) || null;
      if (option) selectedOptionCache.value = option;
    },
    { immediate: true },
  );

  watch(
    () => [
      props.source,
      props.branchId,
      props.excludeProductId,
      props.minAvailableQuantity,
      JSON.stringify(props.inventoryQuery || {}),
      props.reservationOnly,
    ],
    () => {
      if (!props.autoLoad) return;
      if (props.source === "options") return;
      cancelSearch();
      searchTerm.value = "";
      reload("");
    },
    { immediate: true },
  );

  return {
    isLoading,
    optionLabelKey,
    canSelect,
    activeFilterFields,
    resolvedOptions,
    selectedOption,
    onUpdate,
    onFilter,
    reload,
    searchTerm,
  };
}
