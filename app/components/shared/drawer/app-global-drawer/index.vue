<template>
  <Drawer
    :visible="visible"
    position="right"
    :modal="true"
    :dismissable="true"
    :blockScroll="true"
    :baseZIndex="1400"
    :header="title"
    class="app-global-drawer"
    :pt="{
      root: {
        class: 'app-global-drawer-panel',
        style: drawerStyle,
      },
      header: { class: 'text-right' },
      content: { class: 'overflow-y-auto' },
      mask: { class: 'backdrop-blur-[1px]' },
    }"
    @update:visible="onVisibleChange"
  >
    <slot />
  </Drawer>
</template>

<script setup>
import Drawer from "primevue/drawer";

defineOptions({ name: "AppGlobalDrawer" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "" },
  width: { type: String, default: "400px" },
});

const emit = defineEmits(["update:visible"]);

const drawerStyle = computed(() => ({
  width: `min(${props.width}, 100vw)`,
  maxWidth: "100vw",
}));

const onVisibleChange = (value) => {
  emit("update:visible", value);
};
</script>

<style scoped>
:deep(.app-global-drawer-panel) {
  max-width: 100vw !important;
}
</style>
