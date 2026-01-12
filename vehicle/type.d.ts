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

  export type AddVehicleBrandBody =
  {
    name: string;
  }
  export type UpdateVehicleBrandBody =
  {
    vehicleTypeId: number;
    name: string;
  }
  export type AddVehicleBody =
  {
    model: string;
    makeId: number;
    categoryId: number;
  }
  export type AddVehicleTypeBody =
  {
    name?: string;
  }