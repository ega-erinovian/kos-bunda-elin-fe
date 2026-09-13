export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginated<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}
