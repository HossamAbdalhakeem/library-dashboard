<template>
  <div ref="rootRef" class="relative" dir="rtl">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-right text-sm transition hover:bg-slate-800"
      :disabled="loading && !years.length"
      @click="toggle"
    >
      <div class="min-w-0 flex-1">
        <p class="text-[11px] text-slate-500">العام الدراسي</p>
        <p class="truncate font-semibold text-white">
          {{ selectedLabel }}
        </p>
      </div>
      <i
        class="pi pi-chevron-down text-xs text-slate-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <div
      v-if="open"
      class="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl"
    >
      <div class="max-h-56 overflow-y-auto py-1">
        <div
          v-if="!years.length"
          class="px-3 py-4 text-center text-xs text-slate-500"
        >
          لا توجد أعوام دراسية
        </div>

        <button
          v-for="year in years"
          :key="year.id"
          type="button"
          class="group flex w-full items-center justify-between gap-2 px-3 py-2.5 text-right text-sm transition hover:bg-white/5"
          :class="
            String(year.id) === String(selectedId)
              ? 'bg-primary-500/10 text-primary-200'
              : 'text-slate-200'
          "
          @click="onSelect(year)"
        >
          <span class="min-w-0 flex-1 truncate">{{ year.name }}</span>
          <span class="flex shrink-0 items-center gap-1">
            <span
              v-if="isActiveYear(year)"
              class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300"
            >
              نشط
            </span>
            <span
              class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-white/10 hover:text-primary-300 group-hover:opacity-100"
              title="إدارة"
              @click.stop="openEdit(year)"
            >
              <i class="pi pi-cog text-xs" />
            </span>
          </span>
        </button>
      </div>

      <div class="border-t border-white/10 p-2">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500/15 px-3 py-2 text-sm font-medium text-primary-200 transition hover:bg-primary-500/25"
          @click="openCreate"
        >
          <i class="pi pi-plus text-xs" />
          <span>إضافة عام دراسي</span>
        </button>
      </div>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      dir="rtl"
      :header="dialogTitle"
      :style="{ width: '28rem', maxWidth: '95vw' }"
      :dismissableMask="true"
      @hide="editingItem = null"
    >
      <AcademicYearForm
        v-if="dialogVisible"
        :academic-year="editingItem"
        @saved="handleSaved"
        @cancel="dialogVisible = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import Dialog from "primevue/dialog";
import { storeToRefs } from "pinia";
import { useAppToast } from "~/composables/useAppToast";
import { useAuthStore } from "~/store/auth.js";
import { useAcademicYearStore } from "~/store/academicYear.js";

const AcademicYearForm = defineAsyncComponent(() =>
  import("~/components/dashboard/AcademicYearForm.vue"),
);

defineOptions({ name: "AcademicYearSwitcher" });

const authStore = useAuthStore();
const academicYearStore = useAcademicYearStore();
const { years, loading, selectedId, selectedYear, activeId } =
  storeToRefs(academicYearStore);

const { showSuccess, showError } = useAppToast();

const open = ref(false);
const rootRef = ref(null);
const dialogVisible = ref(false);
const editingItem = ref(null);

const selectedLabel = computed(
  () =>
    selectedYear.value?.name ||
    (loading.value ? "جاري التحميل..." : "اختر العام الدراسي"),
);

const dialogTitle = computed(() =>
  editingItem.value?.id ? "إدارة العام الدراسي" : "إضافة عام دراسي",
);

const isActiveYear = (year) =>
  activeId.value && String(year.id) === String(activeId.value);

const toggle = () => {
  open.value = !open.value;
};

const onSelect = (year) => {
  open.value = false;
  const nextId = year?.id ? String(year.id) : null;
  if (!nextId) return;

  if (selectedId.value && String(selectedId.value) === nextId) return;

  academicYearStore.setSelectedId(nextId);
  if (import.meta.client) window.location.reload();
};

const openCreate = () => {
  open.value = false;
  editingItem.value = null;
  dialogVisible.value = true;
};

const openEdit = (year) => {
  open.value = false;
  editingItem.value = year;
  dialogVisible.value = true;
};

const handleSaved = async () => {
  dialogVisible.value = false;
  editingItem.value = null;
  showSuccess("تم حفظ العام الدراسي بنجاح.");
  try {
    await academicYearStore.fetchYears({ force: true });
  } catch (error) {
    showError(error?.message || "تعذر تحديث قائمة الأعوام الدراسية.");
  }
};

const onDocumentClick = (event) => {
  if (!open.value || !rootRef.value) return;
  if (!rootRef.value.contains(event.target)) open.value = false;
};

onMounted(async () => {
  document.addEventListener("click", onDocumentClick);
  if (!authStore.isLoggedIn) return;
  try {
    await academicYearStore.fetchYears();
  } catch (error) {
    showError(error?.message || "تعذر تحميل الأعوام الدراسية.");
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>
