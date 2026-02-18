
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


export type ProcessManualLocationConfigParams = {
  locationFile?: UploadableFile;
  adminId: string | number;
  bannerId: number;
  fileRepo: Repository<File>;
  adminFileRepo: Repository<AdminFile>;
  bannerLocationRepo: Repository<BannersByLocation>;
  uploadedFiles?: Array<{ provider: string; storageLocation: string }>;
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
export type UploadableFile = {
  filename: string;
  mimetype: string;
  sizeBytes: number;
  toBuffer: () => Promise<Buffer>;
};

export type ProcessManualSelectedUserConfigParams = {
  manualFile?: UploadableFile;
  adminId: string | number;
  bannerId: number;
  fileRepo: Repository<File>;
  adminFileRepo: Repository<AdminFile>;
  userRepo: Repository<User>;
  bannerUserTargetRepo: Repository<BannerUserTarget>;
  uploadedFiles?: Array<{ provider: string; storageLocation: string }>;
};
