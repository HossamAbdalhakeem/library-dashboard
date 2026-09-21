<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :header="dialogTitle"
    :style="{ width: 'min(1320px, 98vw)' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right overflow-x-auto' } }"
    @update:visible="$emit('update:visible', $event)"
    @hide="$emit('hide')"
  >
    <div class="flex flex-col gap-4">
      <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <DateRangePicker
          v-model:from="filters.from"
          v-model:to="filters.to"
          label="من / إلى"
          placeholder="اختر الفترة"
          @change="onFiltersChange"
        />

        <AppGlobalSelectTeacher
          v-model="filters.teacherId"
          label="المدرس"
          placeholder="كل المدرسين"
          show-clear
          :exclude-inactive="false"
          @update:model-value="onFiltersChange"
        />

        <ProductSelect
          v-model="filters.productId"
          source="catalog"
          variant="simple"
          name-only
          label="المنتج"
          placeholder="كل المنتجات"
          show-clear
          @update:model-value="onFiltersChange"
        />
      </div>

      <AppDataTable
        :value="rows"
        :columns="columns"
        :loading="loading"
        paginator
        lazy
        :rows="pagination.perPage"
        :first="pagination.first"
        :total-records="pagination.total"
        empty-message="لا توجد معاملات لهذا الطالب."
        @page="onPage"
      >
        <template #product="{ data }">
          <ProductCell :product="data.productCell" />
        </template>
        <template #date="{ data }">
          <AppDateTimeCell :value="data.date" />
        </template>
        <template #typeLabel="{ data }">
          <AppStatusTag
            kind="transaction"
            :code="data.type"
            :label="data.typeLabel"
          />
        </template>
        <template #amountLabel="{ data }">
          <span
            class="font-semibold"
            :class="data.type === 'RETURN' ? 'text-rose-600' : 'text-emerald-700'"
          >
            {{ data.amountLabel }}
          </span>
        </template>
        <template #paymentMethod="{ data }">
          <PaymentProofThumb
            :method="data.paymentMethod"
            :method-label="data.paymentMethodLabel"
            :payment-id="data.paymentId"
            :proof-url="data.proofUrl"
            :has-proof="data.hasProof"
          />
        </template>
        <template #statusLabel="{ data }">
          <AppStatusTag
            :kind="transactionStatusKind(data.type)"
            :code="data.status"
            :label="data.statusLabel"
            :severity="data.statusSeverity"
          />
        </template>
      </AppDataTable>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import DateRangePicker from "~/components/shared/date-range-picker/index.vue";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import ProductCell from "~/components/shared/product-cell/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/app-global-select-teacher/index.vue";
import { studentService } from "~/services/studentService";
import { useAppToast } from "~/composables/useAppToast";
import { formatMoney } from "~/utils/format";
import { PAYMENT_METHOD_LABELS } from "~/utils/paymentMethods";
import { getStatusTagMeta, getStatusTagSeverity } from "~/utils/statusTags";
import {
  getReservationStatusLabel,
  getSaleStatusLabel,
  getTransactionTypeLabel,
} from "~/utils/domainLabels";

const props = defineProps({
  visible: { type: Boolean, default: false },
  student: { type: Object, default: null },
});

defineEmits(["update:visible", "hide"]);

const { showError } = useAppToast();

const loading = ref(false);
const rows = ref([]);

const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

const TYPE_META = {
  SALE: getStatusTagMeta("transaction", "SALE"),
  RESERVATION: getStatusTagMeta("transaction", "RESERVATION"),
  RETURN: getStatusTagMeta("transaction", "RETURN"),
  EXCHANGE: getStatusTagMeta("transaction", "EXCHANGE"),
};

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

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

const statusSeverity = (status, type) => {
  const normalizedType = String(type || "").toUpperCase();

  if (normalizedType === "SALE") return "success";
  if (normalizedType === "RETURN") return "danger";
  if (normalizedType === "EXCHANGE") {
    return getStatusTagSeverity("sale", status);
  }
  return getStatusTagSeverity("reservation", status);
};

const columns = [
  { field: "date", header: "التاريخ", slot: "date" },
  { field: "typeLabel", header: "النوع", slot: "typeLabel" },
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "branchName", header: "الفرع" },
  { field: "quantity", header: "الكمية" },
  { field: "amountLabel", header: "المبلغ", slot: "amountLabel" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
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

const normalizeTransaction = (item) => {
  const type = String(item.type || item.transactionType || "").toUpperCase();
  const typeMeta = TYPE_META[type] || {
    label: getTransactionTypeLabel(type),
    severity: "warn",
  };
  const dateValue = item.date || item.createdAt || item.created_at;
  const amount = item.amount ?? item.totalAmount ?? item.paidAmount ?? 0;
  const productName =
    item.productName ||
    item.product?.name ||
    item.product_name ||
    null;
  const teacherName =
    item.teacherName ||
    item.teacher?.name ||
    item.teacher_name ||
    null;
  const studyYearName =
    item.studyYearName ||
    item.studyYear?.name ||
    item.product?.studyYear?.name ||
    null;
  const branchName =
    item.branchName ||
    item.branch?.name ||
    item.branch_name ||
    "—";
  const status = item.status || "";
  const statusLabel =
    type === "SALE" || type === "RETURN" || type === "EXCHANGE"
      ? getSaleStatusLabel(status)
      : getReservationStatusLabel(status);
  const paymentMethod = String(item.paymentMethod || "CASH").toUpperCase();

  return {
    ...item,
    type,
    typeLabel: typeMeta.label,
    date: dateValue,
    amountLabel: formatMoney(amount),
    productName: productName || "—",
    teacherName: teacherName ? `أ. ${teacherName}` : "—",
    productCell: {
      name: productName,
      teacherName,
      studyYearName,
    },
    branchName,
    quantity: item.quantity ?? item.qty ?? "—",
    statusLabel,
    paymentId: item.paymentId || null,
    paymentMethod,
    paymentMethodLabel:
      item.paymentMethodLabel ||
      PAYMENT_METHOD_LABELS[paymentMethod] ||
      paymentMethod ||
      "—",
    proofUrl: item.proofUrl || null,
    hasProof: Boolean(item.hasProof),
    statusSeverity: statusSeverity(status, type),
  };
};

/** Support both `{ data, pagination }` and legacy `{ transactions }` shapes */
const extractRows = (result) => {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.transactions)) return result.transactions;
  if (Array.isArray(result)) return result;
  return [];
};

const loadTransactions = async () => {
  if (!props.student?.id) return;
  loading.value = true;
  try {
    const result = await studentService.getStudentTransactions(
      props.student.id,
      buildParams(),
    );
    rows.value = extractRows(result).map(normalizeTransaction);
    pagination.total = Number(
      result?.pagination?.total ?? extractRows(result).length,
    );
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
</script>
