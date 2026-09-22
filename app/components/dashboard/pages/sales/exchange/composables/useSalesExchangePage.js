import { exchangeService } from "~/services/exchangeService";
import { useAppToast } from "~/composables/useAppToast";
import { normalizeEligibleSale } from "~/utils/normalizeEligibleSale";

/**
 * List + dialog orchestration for the sales exchange/refund page.
 */
export function useSalesExchangePage() {
  const { showError } = useAppToast();

  const loading = ref(true);
  const sales = ref([]);
  const selectedSale = ref(null);
  const refundOpen = ref(false);
  const exchangeOpen = ref(false);
  const filters = reactive({ search: "" });
  const pagination = reactive({
    page: 1,
    perPage: 20,
    total: 0,
    first: 0,
  });

  const buildQuery = () => {
    const params = {
      page: pagination.page,
      per_page: pagination.perPage,
    };
    if (filters.search?.trim()) params.search = filters.search.trim();
    return params;
  };

  const resetPagination = () => {
    pagination.page = 1;
    pagination.first = 0;
  };

  const loadData = async () => {
    loading.value = true;
    try {
      const result = await exchangeService.getEligibleSales(buildQuery());
      sales.value = (result.data || []).map(normalizeEligibleSale);
      pagination.total = result.pagination?.total || 0;
    } catch (error) {
      showError(error?.message || "تعذر تحميل المبيعات.");
      sales.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  const onPage = (event) => {
    pagination.page = event.page + 1;
    pagination.perPage = event.rows;
    pagination.first = event.first;
    loadData();
  };

  const onSearch = (value) => {
    filters.search = value;
    resetPagination();
    loadData();
  };

  const openRefund = (item) => {
    if (!item?.saleId || !item?.saleItemId) {
      showError("تعذر فتح الاسترداد: بيانات السطر غير مكتملة.");
      return;
    }
    if (!item.canModify && item.quantity?.remaining <= 0) {
      showError("لا توجد كمية متبقية للاسترداد على هذا السطر.");
      return;
    }
    selectedSale.value = item;
    exchangeOpen.value = false;
    refundOpen.value = true;
  };

  const openExchange = (item) => {
    if (!item?.saleId || !item?.saleItemId) {
      showError("تعذر فتح الاستبدال: بيانات السطر غير مكتملة.");
      return;
    }
    if (!item.canModify && item.quantity?.remaining <= 0) {
      showError("لا توجد كمية متبقية للاستبدال على هذا السطر.");
      return;
    }
    selectedSale.value = item;
    refundOpen.value = false;
    exchangeOpen.value = true;
  };

  const onFlowDone = async () => {
    selectedSale.value = null;
    await loadData();
  };

  const onFlowClose = () => {
    if (!refundOpen.value && !exchangeOpen.value) {
      selectedSale.value = null;
    }
  };

  onMounted(loadData);

  return {
    loading,
    sales,
    selectedSale,
    refundOpen,
    exchangeOpen,
    pagination,
    onPage,
    onSearch,
    openRefund,
    openExchange,
    onFlowDone,
    onFlowClose,
  };
}
