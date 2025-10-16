export interface CarSearchQuery {
    model?: string;           
    make?: string;            
    category?: string;       
    page?: number;            
    limit?: number;           
    sortBy?: "model" | "make" | "category";
    sortOrder?: "ASC" | "DESC" | "asc" | "desc";
  }