import { studentApi, normalizeStudentTransaction } from "~/services/student";
import { useAppToast } from "~/composables/useAppToast";

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

/**
 * Student transactions dialog data, filters, and pagination.
 */
export function useStudentTransactions(props) {
  const { showError } = useAppToast();

  const loading = ref(false);
  const rows = ref([]);

  const pagination = reactive({
    page: 1,
    perPage: 20,
    total: 0,
    first: 0,
  });

  const filters = reactive({
    from: monthStart(),
    to: today(),
    teacherId: null,
    productId: null,
  });

  const dialogTitle = computed(() =>
    props.student?.name
      ? `معاملات الطالب: ${props.student.name}`
      : "معاملات الطالب",
  );

  const transactionStatusKind = (type) => {
    const normalized = String(type || "").toUpperCase();
    return normalized === "SALE" ||
      normalized === "RETURN" ||
      normalized === "EXCHANGE"
      ? "sale"
      : "reservation";
  };

  const columns = [
    { field: "date", header: "التاريخ", slot: "date" },
    { field: "typeLabel", header: "النوع", slot: "typeLabel" },
    { field: "productCell", header: "المنتج", slot: "product" },
    { field: "branchName", header: "الفرع" },
    { field: "quantity", header: "الكمية" },
    { field: "amountLabel", header: "المبلغ", slot: "amountLabel" },
    {
      field: "paymentMethodLabel",
      header: "طريقة الدفع",
      slot: "paymentMethod",
    },
    { field: "statusLabel", header: "الحالة", slot: "statusLabel" },
  ];

  const buildParams = () => {
    const params = {
      page: pagination.page,
      per_page: pagination.perPage,
    };
    if (filters.from) {
      params.from = new Date(`${filters.from}T00:00:00`).toISOString();
    }
    if (filters.to) {
      params.to = new Date(`${filters.to}T23:59:59.999`).toISOString();
    }
    if (filters.teacherId) params.teacherId = filters.teacherId;
    if (filters.productId) params.productId = filters.productId;
    return params;
  };

  const loadTransactions = async () => {
    if (!props.student?.id) return;
    loading.value = true;
    try {
      const result = await studentApi.getStudentTransactions(
        props.student.id,
        buildParams(),
      );
      const data = Array.isArray(result?.data) ? result.data : [];
      rows.value = data.map(normalizeStudentTransaction);
      pagination.total = Number(result?.pagination?.total ?? data.length);
    } catch (error) {
      rows.value = [];
      pagination.total = 0;
      showError(error?.message || "تعذر تحميل معاملات الطالب.");
    } finally {
      loading.value = false;
    }
  };

  const resetPagination = () => {
    pagination.page = 1;
    pagination.first = 0;
  };

  const onFiltersChange = (payload) => {
    if (payload && typeof payload === "object") {
      if ("from" in payload) filters.from = payload.from;
      if ("to" in payload) filters.to = payload.to;
    }
    resetPagination();
    loadTransactions();
  };

  const onPage = (event) => {
    pagination.page = event.page + 1;
    pagination.perPage = event.rows;
    pagination.first = event.first;
    loadTransactions();
  };

  watch(
    () => [props.visible, props.student?.id],
    async ([open]) => {
      if (!open || !props.student?.id) return;
      filters.from = monthStart();
      filters.to = today();
      filters.teacherId = null;
      filters.productId = null;
      resetPagination();
      await loadTransactions();
    },
    { immediate: true },
  );

  return {
    loading,
    rows,
    pagination,
    filters,
    dialogTitle,
    columns,
    transactionStatusKind,
    onFiltersChange,
    onPage,
  };
}
