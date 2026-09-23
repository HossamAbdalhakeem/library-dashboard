<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200">
    <table class="w-full text-right text-sm">
      <thead class="bg-slate-100 text-slate-700">
        <tr>
          <th class="px-3 py-2">المنتج</th>
          <th class="px-3 py-2">الكمية المُسلّمة</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!productId || !quantity" class="text-slate-400">
          <td colspan="2" class="px-3 py-4 text-center">
            سيظهر الملخص هنا بعد اختيار المنتج والكمية
          </td>
        </tr>
        <tr v-else>
          <td class="px-3 py-3">{{ productName }}</td>
          <td class="px-3 py-3">{{ quantity }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineOptions({ name: "AddStockSummary" });

defineProps({
  productId: { type: [String, Number, null], default: null },
  productName: { type: String, default: "-" },
  quantity: { type: [Number, null], default: null },
});
</script>
