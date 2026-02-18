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
export type ListRewardBodySearch={
    search?:string
}
export type ListRewardBody = {
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

export type ProcessManualLocationConfigParams = {
  locationFile?: NormalizedFile;
  adminId: string | number;
  rewardId: number;
  fileRepo: Repository<File>;
  adminFileRepo: Repository<AdminFile>;
  rewardsByLocationRepo: Repository<RewardsByLocation>;
  uploadedFiles?: Array<{ provider: string; storageLocation: string }>;
};

export type ParsedLocation = {
  latitude: number;
  longitude: number;
};

export type SaveFileAndAdminFileParams = {
  adminId: number | string;
  category: string;
  uploadResult: {
    fileName: string;
    storageLocation: string;
    provider: string;
    url: string;
  };
  mimeType: string;
  sizeBytes: number;
};

export type ProcessManualSelectedUserConfigParams = {
  manualFile?: NormalizedFile;
  adminId: string | number;
  rewardId: number;
  fileRepo: Repository<File>;
  adminFileRepo: Repository<AdminFile>;
  userRepo: Repository<User>;
  rewardUserTargetRepo: Repository<RewardUserTarget>;
  uploadedFiles?: Array<{ provider: string; storageLocation: string }>;
};
