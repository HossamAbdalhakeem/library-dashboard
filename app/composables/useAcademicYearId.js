import { useAcademicYearStore } from "~/store/academicYear";

const STORAGE_KEY = "academicYearId";

/** Current academic year id (Pinia store, synced to localStorage). */
export const useAcademicYearId = () => {
  const store = useAcademicYearStore();

  const academicYearId = computed(() =>
    store.selectedId ? String(store.selectedId) : null,
  );

  const setAcademicYearId = (id) => {
    store.setSelectedId(id);
  };

  return {
    academicYearId,
    setAcademicYearId,
    STORAGE_KEY,
  };
};
