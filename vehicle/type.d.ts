export interface CarSearchQuery {
  search?: string;
  makeId?: number;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";
}

export type CarBrandQuery =
  {
    page?: number;
    limit?: number;
  }