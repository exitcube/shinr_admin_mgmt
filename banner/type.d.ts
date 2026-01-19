
export type UpdateBannerCategoryBody = {
    id:string;
    updatingText:string;
}

export type ListBannerBodySearch = {
    search?: string;
}
export type ListBannerBody = {
    status?: string;
    reviewStatus?: string;
    owner?: string;
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