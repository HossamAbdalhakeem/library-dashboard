<template>
  <Drawer
    :visible="visible"
    position="right"
    :modal="true"
    :dismissable="true"
    :blockScroll="true"
    :baseZIndex="1400"
    :header="title"
    class="product-form-drawer"
    :pt="{
      root: {
        class: 'product-form-drawer-panel',
        style: {
          width: '400px',
          maxWidth: '400px',
        },
      },
      header: { class: 'text-right' },
      content: { class: 'overflow-y-auto' },
      mask: { class: 'backdrop-blur-[1px]' },
    }"
    @update:visible="onVisibleChange"
  >
    <ProductForm
      v-if="visible"
      :product="product"
      @saved="onSaved"
      @cancel="close"
    />
  </Drawer>
</template>

<script setup>
import Drawer from "primevue/drawer";

const ProductForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/products/ProductForm.vue"),
);

defineProps({
  visible: { type: Boolean, default: false },
  product: { type: Object, default: null },
  title: { type: String, default: "المنتج" },
});

const emit = defineEmits(["update:visible", "saved"]);

const onVisibleChange = (value) => {
  emit("update:visible", value);
};

const close = () => {
  emit("update:visible", false);
};

const onSaved = (result) => {
  emit("saved", result);
  emit("update:visible", false);
};
</script>

<style scoped>
:deep(.product-form-drawer-panel) {
  width: 400px !important;
  max-width: 400px !important;
}
</style>
