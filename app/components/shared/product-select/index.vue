<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <Select
      :model-value="modelValue"
      :options="resolvedOptions"
      :option-label="optionLabelKey"
      option-value="value"
      :placeholder="placeholder"
      filter
      :filter-fields="activeFilterFields"
      :loading="isLoading"
      :disabled="disabled || !canSelect"
      :show-clear="showClear"
      :invalid="invalid"
      class="w-full product-select"
      :class="{ 'p-invalid': invalid }"
      @filter="onFilter"
      @update:model-value="onUpdate"
    >
      <template v-if="variant === 'rich'" #value="{ placeholder: valuePlaceholder }">
        <div v-if="selectedOption" class="w-full min-w-0 py-0.5 text-right">
          <div class="flex items-start justify-between gap-2 sm:gap-3">
            <span class="min-w-0 truncate font-medium text-slate-100">{{ selectedOption.name }}</span>
            <span
              v-if="selectedOption.availabilityLabel"
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="
                selectedOption.isAvailable
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : selectedOption.reservationAllowed
                    ? 'bg-orange-500/20 text-orange-300'
                    : 'bg-amber-500/20 text-amber-200'
              "
            >
              {{ selectedOption.availabilityLabel }}
            </span>
          </div>
          <div class="mt-0.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <p v-if="selectedOption.teacherName" class="min-w-0 truncate text-xs text-slate-400">
              مقدم من أ/ {{ selectedOption.teacherName }}
            </p>
            <span
              v-if="selectedOption.priceLabel"
              class="shrink-0 text-xs"
              :class="selectedOption.isSellingPrice ? 'text-primary-300' : 'text-amber-200'"
            >
              {{ selectedOption.priceKindLabel }} {{ selectedOption.priceLabel }}
            </span>
          </div>
        </div>
        <span v-else>{{ valuePlaceholder }}</span>
      </template>

      <template v-if="variant === 'rich'" #option="{ option }">
        <div class="w-full min-w-0 py-1 text-right">
          <div class="flex items-start justify-between gap-2 sm:gap-3">
            <span class="min-w-0 truncate font-medium">{{ option.name }}</span>
            <span
              v-if="option.availabilityLabel"
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="
                option.isAvailable
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : option.reservationAllowed
                    ? 'bg-orange-500/15 text-orange-700'
                    : 'bg-amber-500/15 text-amber-700'
              "
            >
              {{ option.availabilityLabel }}
            </span>
          </div>
          <div class="mt-0.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <p v-if="option.teacherName" class="min-w-0 truncate text-xs text-slate-400">
              مقدم من أ/ {{ option.teacherName }}
            </p>
            <span
              v-if="option.priceLabel"
              class="shrink-0 text-sm"
              :class="option.isSellingPrice ? 'text-primary-600' : 'text-amber-700'"
            >
              {{ option.priceKindLabel }} {{ option.priceLabel }}
            </span>
          </div>
        </div>
      </template>
    </Select>

    <small v-if="hint" class="text-xs text-slate-400">{{ hint }}</small>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import { inventoryService } from "~/services/inventoryService";
import { productService } from "~/services/productService";
import {
  mapCatalogProductOption,
  mapInventoryProductOptions,
} from "~/utils/productOptions";
import { useAppToast } from "~/composables/useAppToast";
import { useDebouncedCallback } from "~/composables/useDebouncedCallback";

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array, default: null },
  label: { type: String, default: "المنتج" },
  placeholder: { type: String, default: "اختر المنتج" },
  hint: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showClear: { type: Boolean, default: false },
  variant: {
    type: String,
    default: "rich",
    validator: (value) => ["rich", "simple"].includes(value),
  },
  /** When true, dropdown shows product name only (no price / availability in label). */
  nameOnly: { type: Boolean, default: false },
  source: {
    type: String,
    default: "options",
    validator: (value) => ["options", "inventory", "catalog"].includes(value),
  },
  branchId: { type: [String, Number], default: null },
  inventoryQuery: { type: Object, default: () => ({}) },
  excludeProductId: { type: [String, Number], default: null },
  minAvailableQuantity: { type: Number, default: 0 },
  reservationOnly: { type: Boolean, default: false },
  autoLoad: { type: Boolean, default: true },
  filterFields: {
    type: Array,
    default: () => ["name", "teacherName", "label"],
  },
  throttleMs: { type: Number, default: 400 },
  perPage: { type: Number, default: 20 },
  wrapperClass: { type: String, default: "" },
  labelClass: { type: String, default: "text-slate-700" },
});

const emit = defineEmits([
  "update:modelValue",
  "select",
  "change",
  "loaded",
  "loading",
  "search",
]);

const { showError } = useAppToast();

const internalOptions = ref([]);
const internalLoading = ref(false);
const searchTerm = ref("");
const selectedOptionCache = ref(null);
const requestId = ref(0);

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

const markRemoteMatch = (options, term) => {
  const q = String(term || "").trim();
  if (!q) return options;
  return options.map((option) => ({
    ...option,
    _remoteMatch: q,
  }));
};

const withSelectedOption = (options) => {
  const list = Array.isArray(options) ? [...options] : [];
  const selected = selectedOption.value;
  if (!selected?.value) return list;
  if (list.some((item) => item.value === selected.value)) return list;
  return [selected, ...list];
};

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

defineExpose({
  reload,
  selectedOption,
  options: resolvedOptions,
  searchTerm,
});
</script>
