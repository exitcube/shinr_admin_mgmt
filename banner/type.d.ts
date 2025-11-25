
export type CreateBannerBody = {
    text?: string;
    bgColour?: string;
    bgImageId?: string;
    buttonText: string;
    targetValue: string;
}
export type UpdateBannerBody = {
    text?: string;
    bgColour?: string;
    bgImageId?: string;
    buttonText?: string;
    targetValue?: string;
}
export type ListBannerQuery={
    search?:string;
    page?: number;
    limit?: number;
    sortOrder?: 'ASC' | 'DESC';
}