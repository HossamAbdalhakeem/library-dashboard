<template>
  <div
    class="flex flex-col gap-2 text-right"
    :class="wrapperClass"
    data-testid="select-student"
  >
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <div class="flex items-start gap-2">
      <IconField
        icon-position="right"
        :class="[
          'student-search-field min-w-0 flex-1',
          variant === 'dark' ? 'student-search-field--dark' : 'student-search-field--default',
        ]"
      >
        <InputIcon class="pi pi-search student-search-icon" />
        <AutoComplete
          v-model="inputValue"
          :suggestions="suggestions"
          option-label="label"
          dropdown
          :force-selection="false"
          :loading="loading"
          :placeholder="placeholder"
          class="w-full"
          :class="variant === 'dark' ? 'student-search-autocomplete--dark' : ''"
          :input-class="inputClasses"
          :invalid="invalid"
          :pt="{
            pcInputText: {
              root: { 'data-testid': 'select-student-input' },
            },
          }"
          @complete="onComplete"
          @item-select="onItemSelect"
          @update:model-value="onInput"
        >
          <template #option="{ option }">
            <div class="flex w-full min-w-0 items-center justify-between gap-3 text-right">
              <span class="min-w-0 truncate">{{ option.name }}</span>
              <span class="shrink-0 text-xs text-slate-400">{{ option.phone || "بدون رقم" }}</span>
            </div>
          </template>
        </AutoComplete>
      </IconField>

      <Button
        v-if="showAddButton"
        type="button"
        icon="pi pi-user-plus"
        severity="primary"
        :aria-label="addButtonLabel"
        :title="addButtonLabel"
        class="shrink-0"
        @click="openCreateDrawer"
      />
    </div>

    <AppGlobalDrawer v-model:visible="drawerVisible" :title="drawerTitle">
      <StudentForm
        v-if="drawerVisible"
        @saved="onStudentSaved"
        @cancel="drawerVisible = false"
      />
    </AppGlobalDrawer>
  </div>
</template>

<script setup>
defineOptions({ name: "AppGlobalSelectStudent" });

import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import AppGlobalDrawer from "~/components/shared/drawer/app-global-drawer/index.vue";
import { studentApi, mapStudentOption } from "~/services/student";
import { useDebouncedCallback } from "~/composables/useDebouncedCallback";
import { useAppToast } from "~/composables/useAppToast";

const StudentForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/students/components/form/StudentForm.vue"),
);

const props = defineProps({
  modelValue: { type: Object, default: null },
  label: { type: String, default: "الطالب" },
  placeholder: { type: String, default: "ابحث بالاسم أو رقم الهاتف" },
  mode: {
    type: String,
    default: "picker",
    validator: (value) => ["picker", "filter"].includes(value),
  },
  showAddButton: { type: Boolean, default: true },
  invalid: { type: Boolean, default: false },
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "dark"].includes(value),
  },
  wrapperClass: { type: String, default: "" },
  inputClass: { type: String, default: "" },
  labelClass: { type: String, default: "text-slate-700" },
  debounceMs: { type: Number, default: 350 },
  addButtonLabel: { type: String, default: "إضافة طالب جديد" },
});

const emit = defineEmits(["update:modelValue", "select", "created", "search", "clear"]);

const { showSuccess } = useAppToast();

const loading = ref(false);
const suggestions = ref([]);
const drawerVisible = ref(false);
const inputValue = ref("");

const drawerTitle = "إضافة طالب";

const inputClasses = computed(() =>
  [
    "w-full",
    props.variant === "dark" ? "student-search-input--dark" : "",
    props.inputClass,
  ]
    .filter(Boolean)
    .join(" "),
);

const toInputDisplay = (student) => {
  if (!student?.id) return "";
  return mapStudentOption(student).label;
};

const toSearchTerm = (value) => {
  if (value && typeof value === "object") {
    return String(value.name || value.phone || value.label || "").trim();
  }
  return String(value ?? "").trim();
};

watch(
  () => props.modelValue,
  (value) => {
    if (props.mode !== "picker") return;
    inputValue.value = toInputDisplay(value);
  },
  { immediate: true },
);

const searchStudents = async (term = "") => {
  loading.value = true;
  try {
    const items = await studentApi.searchStudents(term);
    return (items || []).map(mapStudentOption);
  } catch (error) {
    console.error("Failed to search students", error);
    return [];
  } finally {
    loading.value = false;
  }
};

const { run: runSuggestionsSearch } = useDebouncedCallback(async (term) => {
  suggestions.value = await searchStudents(term);
}, props.debounceMs);

const { run: emitFilterSearch } = useDebouncedCallback((term) => {
  emit("search", term);
}, props.debounceMs);

const onComplete = (event) => {
  runSuggestionsSearch(event.query || "");
};

const applyStudent = (student) => {
  const normalized = mapStudentOption(student);
  inputValue.value = normalized.label;
  emit("update:modelValue", normalized);
  emit("select", normalized);
};

const onItemSelect = (event) => {
  const student = mapStudentOption(event.value);

  if (props.mode === "picker") {
    applyStudent(student);
    return;
  }

  inputValue.value = student.label;
  emit("search", student.name || student.phone || "");
  emit("select", student);
};

const onInput = (value) => {
  if (value && typeof value === "object" && value.id) {
    onItemSelect({ value });
    return;
  }

  inputValue.value = value;
  const term = toSearchTerm(value);

  if (props.mode === "picker") {
    emit("update:modelValue", null);
    emit("clear");
    return;
  }

  if (!term) {
    emit("search", "");
    emit("clear");
    return;
  }

  emitFilterSearch(term);
  runSuggestionsSearch(term);
};

const openCreateDrawer = () => {
  drawerVisible.value = true;
};

const onStudentSaved = (student) => {
  drawerVisible.value = false;

  const normalized = mapStudentOption(student);
  if (props.mode === "picker") {
    applyStudent(normalized);
    showSuccess("تم إضافة الطالب بنجاح.");
  } else {
    inputValue.value = normalized.label;
    emit("search", normalized.name || normalized.phone || "");
  }

  emit("created", normalized);
};

const preloadSuggestions = async () => {
  suggestions.value = await searchStudents("");
};

onMounted(preloadSuggestions);
</script>

<style scoped>
.student-search-field :deep(.student-search-icon) {
  font-size: 1.125rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 1;
}

.student-search-field--default :deep(.student-search-icon) {
  color: var(--app-muted-soft);
}

.student-search-field--dark :deep(.student-search-icon) {
  color: var(--app-muted);
}

/* Join input + dropdown as one control (RTL-aware via logical radii) */
.student-search-field :deep(.p-autocomplete) {
  display: flex;
  width: 100%;
  align-items: stretch;
}

.student-search-field :deep(.p-autocomplete .p-inputtext),
.student-search-field :deep(.student-search-input--dark) {
  flex: 1 1 auto;
  min-width: 0;
  border-start-start-radius: 0.75rem;
  border-end-start-radius: 0.75rem;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

.student-search-field :deep(.p-autocomplete .p-autocomplete-dropdown) {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
  border-start-end-radius: 0.75rem;
  border-end-end-radius: 0.75rem;
}

.student-search-field--dark :deep(.student-search-input--dark) {
  border: 1px solid var(--app-border-strong);
  background-color: var(--app-surface);
  color: var(--app-text-strong);
}

.student-search-field--dark :deep(.student-search-input--dark::placeholder) {
  color: var(--app-muted);
}

.student-search-field--dark :deep(.p-autocomplete .p-autocomplete-dropdown) {
  border: 1px solid var(--app-border-strong);
  border-inline-start: 0;
  background-color: var(--app-elevated);
  color: var(--app-text-strong);
}

.student-search-field--default :deep(.p-autocomplete .p-autocomplete-dropdown) {
  border-inline-start: 0;
}
</style>
