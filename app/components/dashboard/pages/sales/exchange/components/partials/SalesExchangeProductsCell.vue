<template>
  <ul class="m-0 list-none space-y-2 p-0 text-right">
    <li
      v-for="item in items"
      :key="item.saleItemId"
      class="text-sm"
    >
      <div class="font-medium text-neutral-100">
        {{ item.product?.name || "—" }}
      </div>
      <div
        v-if="item.exchange?.newProduct?.name"
        class="mt-0.5 text-xs text-primary-400"
      >
        ↲ استبدل بـ {{ item.exchange.newProduct.name }}
      </div>
      <div
        v-if="item.product?.teacher?.name"
        class="text-[11px] text-neutral-400"
      >
        {{ item.product.teacher.name }}
      </div>
    </li>
  </ul>
</template>

<script setup>
defineOptions({ name: "SalesExchangeProductsCell" });

defineProps({
  items: { type: Array, default: () => [] },
});
</script>
