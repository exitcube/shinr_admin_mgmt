
export type CreateBannerBody = {
    text?: string;
    bgColour?: string;
    bgImageId?: string | number;
    buttonText: string;
    targetValue: string;
    title: string;
    category?: string;
    owner?: string;
    vendorId?: string | number;
    homePageView?: boolean;
    displaySequence?: number;
    startTime?: string;
    endTime?: string;
    buttonColour?: string;
}
export type UpdateBannerBody = {
    text?: string;
    bgColour?: string;
    bgImageId?: string;
    buttonText?: string;
    targetValue?: string;
}

export type ApproveBannerBody = {
    status?: string;
}