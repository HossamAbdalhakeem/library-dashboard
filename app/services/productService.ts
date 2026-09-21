import { apiFetch, firstRow, asPaginated, type PaginatedResponse } from "~/utils/apiFetch";
import { ProductType } from "~/enums/productType";

const productBody = (payload: Record<string, any>) => {
  const purchasePrice = Number(payload.purchasePrice ?? payload.wholesale_price);
  const sellingPrice = Number(payload.sellingPrice ?? payload.sale_price);
  const profitPercentage =
    payload.profitPercentage != null
      ? Number(payload.profitPercentage)
      : purchasePrice > 0
        ? Number((((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2))
        : 0;

  const body: Record<string, any> = {
    name: payload.name,
    type: payload.type,
    teacherId: payload.teacherId ?? payload.teacher_id,
    purchasePrice,
    sellingPrice,
    profitPercentage,
    reservationAllowed: Boolean(
      payload.reservationAllowed ?? payload.reservation_allowed ?? false,
    ),
  };

  if (Object.prototype.hasOwnProperty.call(payload, "studyYearId")) {
    body.studyYearId = payload.studyYearId || null;
  } else if (Object.prototype.hasOwnProperty.call(payload, "study_year_id")) {
    body.studyYearId = payload.study_year_id || null;
  } else if (String(payload.type || "").toUpperCase() === ProductType.CARD) {
    // Ensure CARD create/update always sends studyYearId for API validation.
    body.studyYearId = null;
  }

  const academicYearId = payload.academicYearId ?? payload.academic_year_id;
  if (academicYearId) {
    body.academicYearId = academicYearId;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "reservationPrice")) {
    body.reservationPrice = payload.reservationPrice;
  } else if (Object.prototype.hasOwnProperty.call(payload, "reservation_price")) {
    body.reservationPrice = payload.reservation_price;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "minStockQuantity")) {
    body.minStockQuantity =
      payload.minStockQuantity == null || payload.minStockQuantity === ""
        ? null
        : Number(payload.minStockQuantity);
  } else if (Object.prototype.hasOwnProperty.call(payload, "min_stock_quantity")) {
    body.minStockQuantity =
      payload.min_stock_quantity == null || payload.min_stock_quantity === ""
        ? null
        : Number(payload.min_stock_quantity);
  }

  return body;
};

const statusBody = (payload: Record<string, any>) => {
  if (payload.status) return { status: payload.status };
  if (typeof payload.is_active === "boolean") {
    return { status: payload.is_active ? "ACTIVE" : "INACTIVE" };
  }
  return payload;
};

export const productService = {
  async getProducts(params: Record<string, any> = {}): Promise<PaginatedResponse> {
    return asPaginated(await apiFetch("/products", { method: "GET", params }));
  },

  /** Customer-service product search with per-branch availability. */
  async searchProducts(params: Record<string, any> = {}): Promise<PaginatedResponse> {
    return asPaginated(
      await apiFetch("/products/search", { method: "GET", params }),
    );
  },

  async getProduct(id: string) {
    return firstRow(await apiFetch(`/products/${id}`, { method: "GET" }));
  },

  async createProduct(payload: Record<string, any>) {
    const body = productBody(payload);
    if (!body.academicYearId) {
      throw new Error("academicYearId is required when creating a product.");
    }
    return firstRow(
      await apiFetch("/products", {
        method: "POST",
        body,
      }),
    );
  },

  async updateProduct(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/products/${id}`, {
        method: "PATCH",
        body: productBody(payload),
      }),
    );
  },

  async updateProductStatus(id: string, payload: Record<string, any> | boolean) {
    const body =
      typeof payload === "boolean" ? statusBody({ is_active: payload }) : statusBody(payload);

    return firstRow(
      await apiFetch(`/products/${id}/status`, {
        method: "PATCH",
        body,
      }),
    );
  },
};
