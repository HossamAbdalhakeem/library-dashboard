<template>
  <div
    v-if="hasName"
    class="flex min-w-[7rem] max-w-[14rem] flex-col items-start gap-0.5"
    dir="rtl"
  >
    <p
      class="m-0 min-w-0 max-w-full whitespace-normal break-words text-right text-sm font-semibold leading-snug text-neutral-100"
    >
      {{ student.name }}
    </p>
    <p
      v-if="hasPhone"
      class="m-0 truncate text-xs leading-tight tabular-nums text-neutral-400"
    >
      {{ student.phone }}
    </p>
  </div>
  <span v-else class="text-neutral-400">—</span>
</template>

<script setup>
defineOptions({ name: "AppStudentTableCell" });

/**
 * Parent tables must normalize first and pass:
 * { name, phone? }
 */
const props = defineProps({
  student: { type: Object, default: null },
});

const isSet = (value) => {
  if (value == null) return false;
  const text = String(value).trim();
  return text !== "" && text !== "-" && text !== "—";
};

const hasName = computed(() => isSet(props.student?.name));
const hasPhone = computed(() => isSet(props.student?.phone));
</script>
