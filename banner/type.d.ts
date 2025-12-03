
export type UpdateBannerCategoryBody = {
    id:string;
    updatingText:string;
}

export type ListBannerQuery = {
    search?: string;
    status?: string;
    reviewStatus?: string;
    categoryId?: number;
    vendorId?: number;
    page?: number;
    limit?: number;
    sortOrder?: 'ASC' | 'DESC';
}
