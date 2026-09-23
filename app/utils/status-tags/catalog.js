/**
 * Central status/type tag catalog for tables.
 * Used by AppStatusTableCell (PrimeVue Tag).
 *
 * @typedef {"reservation"|"entity"|"stock-movement"|"transaction"|"sale"|"product-availability"|"product-type"} StatusTagKind
 */

import { RESERVATION_STATUS_TAGS } from "./reservation";
import { ENTITY_STATUS_TAGS } from "./entity";
import { STOCK_MOVEMENT_TAGS } from "./inventory";
import { TRANSACTION_TYPE_TAGS } from "./transaction";
import { SALE_STATUS_TAGS } from "./sale";
import {
  PRODUCT_AVAILABILITY_TAGS,
  PRODUCT_TYPE_TAGS,
} from "./product";

/** @type {Record<StatusTagKind, Record<string, { label: string, severity: string }>>} */
export const STATUS_TAG_CATALOGS = Object.freeze({
  reservation: RESERVATION_STATUS_TAGS,
  entity: ENTITY_STATUS_TAGS,
  "stock-movement": STOCK_MOVEMENT_TAGS,
  transaction: TRANSACTION_TYPE_TAGS,
  sale: SALE_STATUS_TAGS,
  "product-availability": PRODUCT_AVAILABILITY_TAGS,
  "product-type": PRODUCT_TYPE_TAGS,
});

/**
 * @param {StatusTagKind | string} kind
 * @param {string | null | undefined} code
 * @param {{ label?: string, severity?: string }} [fallback]
 */
export const getStatusTagMeta = (kind, code, fallback = {}) => {
  const key = String(code || "").toUpperCase();
  const catalog = STATUS_TAG_CATALOGS[kind] || {};
  const meta = catalog[key];

  return {
    code: key || "",
    label: meta?.label || fallback.label || key || "—",
    severity: meta?.severity || fallback.severity || "secondary",
  };
};

/**
 * @param {StatusTagKind | string} kind
 * @param {string | null | undefined} code
 */
export const getStatusTagSeverity = (kind, code) =>
  getStatusTagMeta(kind, code).severity;

/**
 * @param {StatusTagKind | string} kind
 * @param {string | null | undefined} code
 */
export const getStatusTagLabel = (kind, code) =>
  getStatusTagMeta(kind, code).label;
