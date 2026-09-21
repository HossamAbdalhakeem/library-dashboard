<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <Select
      :model-value="modelValue"
      :options="resolvedOptions"
      option-label="label"
      option-value="value"
      :placeholder="placeholder"
      filter
      :loading="isLoading"
      :disabled="disabled || isLoading"
      :show-clear="showClear"
      :invalid="invalid"
      class="w-full"
      :class="[selectClass, { 'p-invalid': invalid }]"
      @update:model-value="onUpdate"
    />

    <small v-if="hint" class="text-xs text-slate-400">{{ hint }}</small>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import { branchService } from "~/services/branchService";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "AppGlobalSelectBranch" });

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  /** Pass options to skip auto-fetch; leave null to load from API */
  options: { type: Array, default: null },
  label: { type: String, default: "الفرع" },
  labelClass: { type: String, default: "text-slate-700" },
  wrapperClass: { type: String, default: "" },
  selectClass: { type: String, default: "" },
  placeholder: { type: String, default: "اختر الفرع" },
  hint: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showClear: { type: Boolean, default: false },
  /** When true, omit branches with status INACTIVE */
  excludeInactive: { type: Boolean, default: true },
  /** Prepend a synthetic "all branches" option (e.g. reports filter) */
  includeAllOption: { type: Boolean, default: false },
  allOptionLabel: { type: String, default: "كل الفروع" },
  allOptionValue: { type: [String, Number], default: "all" },
  /** Auto-load branches on mount when options is not provided */
  autoLoad: { type: Boolean, default: true },
  query: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "change", "loaded"]);

const { showError } = useAppToast();

const internalOptions = ref([]);
const internalLoading = ref(false);

const isLoading = computed(() => props.loading || internalLoading.value);

const mapBranchOption = (branch) => ({
  label: branch.name || branch.branch_name || `فرع ${branch.id}`,
  value: branch.id,
  status: branch.status,
  raw: branch,
});

const resolvedOptions = computed(() => {
  const base = Array.isArray(props.options) ? props.options : internalOptions.value;
  if (!props.includeAllOption) return base;
  return [
    { label: props.allOptionLabel, value: props.allOptionValue },
    ...base.filter((option) => option.value !== props.allOptionValue),
  ];
});

const loadBranches = async () => {
  if (!props.autoLoad || Array.isArray(props.options)) return;

  internalLoading.value = true;
  try {
    const branches = await branchService.getBranches(props.query);
    const list = Array.isArray(branches) ? branches : branches?.data || [];
    const mapped = list
      .filter((branch) =>
        props.excludeInactive ? branch.status !== "INACTIVE" : true,
      )
      .map(mapBranchOption);

    internalOptions.value = mapped;
    emit("loaded", mapped);
  } catch (error) {
    internalOptions.value = [];
    showError(error?.message || "تعذر تحميل الفروع.");
  } finally {
    internalLoading.value = false;
  }
};

const onUpdate = (value) => {
  emit("update:modelValue", value ?? null);
  emit("change", value ?? null);
};

const reload = () => loadBranches();

defineExpose({ reload, options: resolvedOptions });

onMounted(() => {
  loadBranches();
});

watch(
  () => props.query,
  () => {
    loadBranches();
  },
  { deep: true },
);
</script>
