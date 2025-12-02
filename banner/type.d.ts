
export type CreateBannerBody = {
    text?: string;
    bgColour?: string;
    bgImageId?: string;
    buttonText: string;
    targetValue: string;
}
export type UpdateBannerCategoryBody = {
    id:string;
    updatingText:string;
}