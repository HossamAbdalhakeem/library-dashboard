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
      :filter-fields="activeFilterFields"
      :loading="isLoading"
      :disabled="disabled || isLoading"
      :show-clear="showClear"
      :invalid="invalid"
      class="w-full"
      :class="[selectClass, { 'p-invalid': invalid }]"
      @filter="onFilter"
      @update:model-value="onUpdate"
    />

    <small v-if="hint" class="text-xs text-slate-400">{{ hint }}</small>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import { teacherService } from "~/services/teacherService";
import { useAppToast } from "~/composables/useAppToast";
import { useThrottledCallback } from "~/composables/useThrottledCallback";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { useAuthStore } from "~/store/auth.js";

defineOptions({ name: "AppGlobalSelectTeacher" });

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  /** Pass options to skip auto-fetch; leave null to load from API */
  options: { type: Array, default: null },
  label: { type: String, default: "المدرس" },
  labelClass: { type: String, default: "text-slate-700" },
  wrapperClass: { type: String, default: "" },
  selectClass: { type: String, default: "" },
  placeholder: { type: String, default: "اختر المدرس" },
  hint: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showClear: { type: Boolean, default: false },
  /** When true, omit teachers with status INACTIVE */
  excludeInactive: { type: Boolean, default: true },
  /** Auto-load teachers on mount when options is not provided */
  autoLoad: { type: Boolean, default: true },
  query: { type: Object, default: () => ({}) },
  throttleMs: { type: Number, default: 400 },
});

const emit = defineEmits(["update:modelValue", "change", "loaded", "search"]);

const { showError } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();

const internalOptions = ref([]);
const internalLoading = ref(false);
const searchTerm = ref("");
const selectedOptionCache = ref(null);
const requestId = ref(0);

const isLoading = computed(() => props.loading || internalLoading.value);
const usesRemoteSearch = computed(() => !Array.isArray(props.options));

const scopedQuery = computed(() => {
  const query = { ...(props.query || {}) };
  if (!query.academicYearId && currentAcademicYearId.value) {
    query.academicYearId = currentAcademicYearId.value;
  }
  return query;
});

const activeFilterFields = computed(() => {
  if (usesRemoteSearch.value && searchTerm.value) return ["_remoteMatch"];
  return ["label"];
});

const mapTeacherOption = (teacher, term = "") => ({
  label: teacher.name || teacher.teacher_name || `مدرس ${teacher.id}`,
  value: teacher.id,
  status: teacher.status,
  raw: teacher,
  ...(term ? { _remoteMatch: term } : {}),
});

const withSelectedOption = (options) => {
  const list = Array.isArray(options) ? [...options] : [];
  const selected =
    list.find((item) => item.value === props.modelValue) ||
    (selectedOptionCache.value?.value === props.modelValue
      ? selectedOptionCache.value
      : null);
  if (!selected?.value) return list;
  if (list.some((item) => item.value === selected.value)) return list;
  return [selected, ...list];
};

const resolvedOptions = computed(() => {
  if (Array.isArray(props.options)) return props.options;
  return internalOptions.value;
});

const loadTeachers = async (term = searchTerm.value) => {
  if (!props.autoLoad || Array.isArray(props.options)) return;
  if (!useAuthStore().isLoggedIn) return;

  const currentRequest = ++requestId.value;
  internalLoading.value = true;
  try {
    const query = String(term || "").trim();
    const teachers = await teacherService.getTeachers({
      ...scopedQuery.value,
      ...(query ? { search: query } : {}),
    });
    if (currentRequest !== requestId.value) return;

    const list = Array.isArray(teachers) ? teachers : teachers?.data || [];
    const mapped = list
      .filter((teacher) =>
        props.excludeInactive ? teacher.status !== "INACTIVE" : true,
      )
      .map((teacher) => mapTeacherOption(teacher, query));

    internalOptions.value = withSelectedOption(mapped);
    emit("loaded", internalOptions.value);
  } catch (error) {
    if (currentRequest !== requestId.value) return;
    internalOptions.value = withSelectedOption([]);
    if (error?.code !== "SESSION_CLEARED" && error?.status !== 401) {
      showError(error?.message || "تعذر تحميل المدرسين.");
    }
  } finally {
    if (currentRequest === requestId.value) internalLoading.value = false;
  }
};

const { run: runRemoteSearch } = useThrottledCallback((term) => {
  loadTeachers(term);
}, props.throttleMs);

const onFilter = (event) => {
  const term = String(event?.value ?? "").trim();
  searchTerm.value = term;
  emit("search", term);
  if (!usesRemoteSearch.value) return;
  runRemoteSearch(term);
};

const onUpdate = (value) => {
  emit("update:modelValue", value ?? null);
  const option =
    resolvedOptions.value.find((item) => item.value === value) ||
    (selectedOptionCache.value?.value === value
      ? selectedOptionCache.value
      : null);
  if (option) selectedOptionCache.value = option;
  emit("change", value ?? null);
};

const reload = (term = searchTerm.value) => loadTeachers(term);

const prependOption = (option) => {
  if (!option?.value) return;
  selectedOptionCache.value = option;
  internalOptions.value = [
    option,
    ...internalOptions.value.filter((item) => item.value !== option.value),
  ];
};

defineExpose({ reload, prependOption, options: resolvedOptions });

onMounted(() => {
  loadTeachers();
});

watch(
  () => props.query,
  () => {
    loadTeachers(searchTerm.value);
  },
  { deep: true },
);

watch(currentAcademicYearId, () => {
  if (!useAuthStore().isLoggedIn) return;
  if (props.modelValue) emit("update:modelValue", null);
  selectedOptionCache.value = null;
  loadTeachers(searchTerm.value);
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value) selectedOptionCache.value = null;
  },
);
</script>
