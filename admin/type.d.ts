export interface CarSearchQuery {         
    make?: string;            
    category?: string;       
    search?: string;          
    searchByModel?: string;   
    makeId?: number;          
    categoryId?: number;      
    page?: number;            
    limit?: number;           
    sortOrder?: "ASC" | "DESC" | "asc" | "desc";
  }