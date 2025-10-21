export interface CarSearchQuery {
    model?: string;           
    make?: string;            
    category?: string;       
    search?: string;          
    searchByModel?: string;   
    page?: number;            
    limit?: number;           
    sortBy?: "model" | "make" | "category";
    sortOrder?: "ASC" | "DESC" | "asc" | "desc";
  }