
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
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
    sortOrder?: 'ASC' | 'DESC';
}

export type BannerApprovalBody={
    bannerId:string;
    action:'approve' | 'reject';
    rejectReason?:string;
}