export interface CarSearchQuery {               
    search?: string;            
    makeId?: number;          
    categoryId?: number;      
    page?: number;            
    limit?: number;           
    sortOrder?: "ASC" | "DESC" | "asc" | "desc";
  }