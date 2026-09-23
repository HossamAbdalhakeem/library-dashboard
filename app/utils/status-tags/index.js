/** Status tag catalogs barrel — prefer category / catalog imports when possible. */

export { RESERVATION_STATUS_TAGS } from "./reservation";
export { ENTITY_STATUS_TAGS } from "./entity";
export { STOCK_MOVEMENT_TAGS } from "./inventory";
export { TRANSACTION_TYPE_TAGS } from "./transaction";
export { SALE_STATUS_TAGS } from "./sale";
export {
  PRODUCT_AVAILABILITY_TAGS,
  PRODUCT_TYPE_TAGS,
} from "./product";
export {
  STATUS_TAG_CATALOGS,
  getStatusTagMeta,
  getStatusTagSeverity,
  getStatusTagLabel,
} from "./catalog";
