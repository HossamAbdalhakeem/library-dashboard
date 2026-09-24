export { bookApi, bookService } from "./api/book.api";

export type {
  NamedRef,
  AcademicYearRef,
  BookProductStatus,
  BookAvailabilityStatus,
  BookResponse,
  BookSearchBranch,
  BookSearchResponse,
  BookSearchQuery,
  BookSearchListItem,
  BookSelection,
} from "./types/book.types";

export {
  normalizeBookSearchItem,
  buildBookSelection,
  buildBookSearchQuery,
} from "./helpers/book-list.helper";
