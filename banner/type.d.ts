
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