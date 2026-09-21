import { toArabicDigits } from "~/utils/format.js";

/**
 * Column resolution, cell formatting, and Arabic paginator digit sync for AppDataTable.
 */
export function useAppDataTable(props, emit) {
  const wrapRef = ref(null);
  let paginatorObserver = null;
  let syncingDigits = false;

  const arabicizePaginatorDigits = () => {
    const root = wrapRef.value;
    if (!root || syncingDigits) return;

    const targets = root.querySelectorAll(
      [
        ".p-paginator-page",
        ".p-paginator-current",
        ".p-paginator .p-select-label",
        ".p-paginator .p-dropdown-label",
      ].join(", "),
    );

    syncingDigits = true;
    try {
      targets.forEach((node) => {
        const raw = node.textContent ?? "";
        if (!/[0-9]/.test(raw)) return;
        const next = toArabicDigits(raw);
        if (raw !== next) node.textContent = next;
      });
    } finally {
      // Defer clear so our own textContent writes don't re-enter the observer.
      queueMicrotask(() => {
        syncingDigits = false;
      });
    }
  };

  const disconnectPaginatorObserver = () => {
    paginatorObserver?.disconnect();
    paginatorObserver = null;
  };

  const bindPaginatorObserver = () => {
    disconnectPaginatorObserver();
    if (!wrapRef.value || typeof MutationObserver === "undefined") return;

    // Prefer the paginator node only — observing the whole table was costly.
    const paginatorEl = wrapRef.value.querySelector(".p-paginator");
    if (!paginatorEl) return;

    paginatorObserver = new MutationObserver(() => {
      if (syncingDigits) return;
      arabicizePaginatorDigits();
    });
    paginatorObserver.observe(paginatorEl, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  const onPage = (event) => {
    emit("page", event);
    nextTick(arabicizePaginatorDigits);
  };

  const onRowExpand = (event) => {
    emit("row-expand", event);
  };

  const attrs = useAttrs();
  const slots = useSlots();

  const tableAttrs = computed(() => {
    const { class: _class, ...rest } = attrs;
    return rest;
  });

  const resolvedColumns = computed(() => {
    const cols = props.columns || [];

    return cols.map((col) => {
      if (col.style || col.headerStyle || col.bodyStyle) {
        return { ...col };
      }

      return {
        ...col,
        style: `min-width: ${col.minWidth || props.minColumnWidth}`,
      };
    });
  });

  const resolvedTableStyle = computed(() => {
    if (props.tableStyle) return props.tableStyle;
    const colCount = Math.max(resolvedColumns.value.length, 1);
    // Grow beyond the container when there are many columns so horizontal scroll appears.
    return `min-width: max(100%, calc(${colCount} * ${props.minColumnWidth}))`;
  });

  const hasCustomBody = (col) =>
    Boolean(col.slot || col.format || (col.field && slots[col.field]));

  const resolveCell = (row, col) => {
    const raw = col.field ? row?.[col.field] : undefined;
    if (typeof col.format === "function") return col.format(raw, row);
    if (raw == null || raw === "") return col.fallback ?? "-";
    return raw;
  };

  onMounted(() => {
    nextTick(() => {
      arabicizePaginatorDigits();
      bindPaginatorObserver();
    });
  });

  onBeforeUnmount(() => {
    disconnectPaginatorObserver();
  });

  watch(
    () => [props.loading, props.first, props.totalRecords, props.value?.length],
    () => {
      nextTick(() => {
        arabicizePaginatorDigits();
        bindPaginatorObserver();
      });
    },
  );

  return {
    wrapRef,
    tableAttrs,
    resolvedColumns,
    resolvedTableStyle,
    hasCustomBody,
    resolveCell,
    onPage,
    onRowExpand,
  };
}
