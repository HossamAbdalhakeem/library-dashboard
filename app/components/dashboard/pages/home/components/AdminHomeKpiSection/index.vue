<template>
  <section class="w-full min-w-0 space-y-3">
    <div>
      <p class="font-bold text-white">نظرة عامة</p>

    </div>

    <AdminHomeKpiSectionSkeleton v-if="loading" />

    <div v-else class="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminHomeKpiCard
        v-for="card in cards"
        :key="card.type"
        :type="card.type"
        :title="card.title"
        :count="card.count"
        :hint="card.hint"
        :clickable="card.clickable !== false"
        @select="onSelect(card)"
      />
    </div>
  </section>
</template>

<script setup>
import { adminReportsApi } from "~/services/reports/admin";

defineOptions({ name: "AdminHomeKpiSection" });

const AdminHomeKpiCard = defineAsyncComponent(() =>
  import("./partials/AdminHomeKpiCard.vue"),
);
const AdminHomeKpiSectionSkeleton = defineAsyncComponent(() =>
  import("./skeletons/AdminHomeKpiSectionSkeleton.vue"),
);

const router = useRouter();
const loading = ref(true);
const summary = ref({
  branchesCount: 0,
  studentsCount: 0,
  productsCount: 0,
  teachersCount: 0,
});

const cards = computed(() => {
  const s = summary.value || {};
  return [
    {
      type: "branches",
      title: "الفروع",
      count: s.branchesCount ?? 0,
      hint: "إجمالي الفروع",
      to: "/branches",
    },
    {
      type: "teachers",
      title: "المدرسين",
      count: s.teachersCount ?? 0,
      hint: "إجمالي المدرسين",
      to: "/teachers",
    },
    {
      type: "students",
      title: "الطلاب",
      count: s.studentsCount ?? 0,
      hint: "إجمالي الطلاب",
      to: "/students",
    },
    {
      type: "products",
      title: "المنتجات",
      count: s.productsCount ?? 0,
      hint: "إجمالي المنتجات",
      to: "/products",
    },
   
  ];
});

const onSelect = (card) => {
  if (card?.to) router.push(card.to);
};

const loadSummary = async () => {
  loading.value = true;
  try {
    summary.value = (await adminReportsApi.getGeneralSummary()) || {
      branchesCount: 0,
      studentsCount: 0,
      productsCount: 0,
      teachersCount: 0,
    };
  } catch {
    summary.value = {
      branchesCount: 0,
      studentsCount: 0,
      productsCount: 0,
      teachersCount: 0,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(loadSummary);
</script>
