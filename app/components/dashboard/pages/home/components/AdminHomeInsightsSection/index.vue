<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">التحليلات</p>
      <p class="mt-0.5 text-xs text-slate-400">
        توزيع المدفوعات وأفضل المنتجات
      </p>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <AdminHomePaymentsSkeleton v-if="paymentsLoading" />
      <PaymentMethodsReport
        v-else
        :items="paymentMethodItems"
        title="طرق الدفع"
        total-label="إجمالي المدفوعات"
        empty-message="لا توجد مدفوعات بعد"
      />

      <AdminHomeTopProductsSkeleton v-if="productsLoading" />
      <AdminHomeTopProductsCard
        v-else
        title="أكثر المنتجات مبيعًا"
        :items="topProducts"
        empty-message="لا توجد مبيعات لعرضها بعد."
      />
    </div>
  </section>
</template>

<script setup>
import {
  adminReportsApi,
  extractPaymentMethodItems,
  extractGeneralTopProducts,
} from "~/services/reports/admin";

defineOptions({ name: "AdminHomeInsightsSection" });

const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment/payment-methods-report/index.vue"),
);
const AdminHomeTopProductsCard = defineAsyncComponent(() =>
  import("./partials/AdminHomeTopProductsCard.vue"),
);
const AdminHomePaymentsSkeleton = defineAsyncComponent(() =>
  import("./skeletons/AdminHomePaymentsSkeleton.vue"),
);
const AdminHomeTopProductsSkeleton = defineAsyncComponent(() =>
  import("./skeletons/AdminHomeTopProductsSkeleton.vue"),
);

const paymentsLoading = ref(true);
const productsLoading = ref(true);
const paymentMethodItems = ref([]);
const topProducts = ref([]);

const loadPayments = async () => {
  paymentsLoading.value = true;
  try {
    const data = await adminReportsApi.getGeneralPayments();
    paymentMethodItems.value = extractPaymentMethodItems(data);
  } catch {
    paymentMethodItems.value = [];
  } finally {
    paymentsLoading.value = false;
  }
};

const loadTopProducts = async () => {
  productsLoading.value = true;
  try {
    const data = await adminReportsApi.getGeneralTopProducts();
    topProducts.value = extractGeneralTopProducts(data);
  } catch {
    topProducts.value = [];
  } finally {
    productsLoading.value = false;
  }
};

onMounted(() => {
  loadPayments();
  loadTopProducts();
});
</script>
