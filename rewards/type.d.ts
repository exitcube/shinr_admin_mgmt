export type CreateRewardBody={
    owner:string,
    vendorId:number,
    title:string,
    sideText:string,
    summary:string,
    description:string,
    rewardCategoryId:number,
    serviceCategoryIds:number[],
    displayCouponPage:boolean,
    displayVendorPage:boolean,
    offerType:string,
    percentage:number,
    maxDiscountAmount:number,
    minOrderValue:number,
    codeGeneration:string,
    priority:number,
    targetAudienceIds:number[],
    startDate:Date,
    endDate:Date,
    totalGrabLimit:number,
    contribution:string,
    shinrPercentage:number,
    vendorPercentage:number,
    maxUsage:number,
    maxUsagePeriod:string,
    maxUsagePeriodValue:number,
    status:string,
}

export type UpdateRewardBody={
    rewardId:number,
    owner:string,
    vendorId:number,
    title:string,
    sideText:string,
    summary:string,
    description:string,
    rewardCategoryId:number,
    serviceCategoryIds:number[],
    displayCouponPage:boolean,
    displayVendorPage:boolean,
    offerType:string,
    percentage:number,
    maxDiscountAmount:number,
    minOrderValue:number,
    codeGeneration:string,
    priority:number,
    targetAudienceIds:number[],
    startDate:Date,
    endDate:Date,
    totalGrabLimit:number,
    contribution:string,
    shinrPercentage:number,
    vendorPercentage:number,
    maxUsage:number,
    maxUsagePeriod:string,
    maxUsagePeriodValue:number,
    status:string,
}

export type ListRewardQuery = {
    search?: string;
    status?: string;
    owner?: string;
    categoryId?: number;
    serviceId?: number;
    vendorId?: number;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
    sortOrder?: 'ASC' | 'DESC';
};