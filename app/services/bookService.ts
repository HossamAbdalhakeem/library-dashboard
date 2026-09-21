import { productService } from "~/services/productService";

export const bookService = {
  async getBooks(params: Record<string, any> = {}) {
    return productService.getProducts({
      ...params,
      type: "book",
    });
  },

  async getBook(id: string) {
    return productService.getProduct(id);
  },
};
