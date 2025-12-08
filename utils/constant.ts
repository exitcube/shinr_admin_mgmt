export const ADMIN_ALLOWED_ROLES = [
  { admin: { displayValue: "Admin", value: "ADMIN" } },
  { superadmin: { displayValue: "Super Admin", value: "SUPER_ADMIN" } },
  { employee: { displayValue: "Employee", value: "EMPLOYEE" } },
];

export enum RefreshTokenStatus {
    ACTIVE = 'ACTIVE',
    USED = 'USED',
    REVOKED = 'REVOKED',
    INACTIVE = 'INACTIVE'
}
export enum BannerOwner{
    SHINR='SHINR',
    VENDOR='VENDOR'
}

export enum BannerTargetAudience{
    EVERYONE='EVERYONE',
    MANUAL='MANUAL',
    SPECIALRULES='SPECIALRULES'
}

export const BannerStatus={
    ACTIVE:{ displayValue: 'Active', value: 'ACTIVE' },
    DRAFT:{ displayValue: 'Draft', value: 'DRAFT' },
    EXPIRED:{ displayValue: 'Expired', value: 'EXPIRED' }
}

export  const BannerReviewStatus={
    APPROVED:{ displayValue: 'Approved', value: 'APPROVED' },
    REJECTED:{ displayValue: 'Rejected', value: 'REJECTED' },
    PENDING:{ displayValue: 'Pending', value: 'PENDING' },
}

 
export const TargetAudience = {
    MANUAL: { displayName: "Manual", value: "MANUAL" },
    EVERYONE: { displayName: "Everyone", value: "EVERYONE" },
    SPECIAL_RULE: { displayName: "Special Rules", value: "SPECIAL_RULE" }
};


export const FILE_PROVIDER={
    LOCAL:'LOCAL',
    S3:'S3'
}

export const  ADMIN_FILE_CATEGORY={
    BANNER:'BANNER_IMAGE',
}

export const BANNER_IMAGE_ALLOWED_MIMETYPE = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp"
];

export const BANNER_IMAGE_MAX_SIZE = 5 * 1024 * 1024; 

export const BANNER_IMAGE_DIMENSION = {
    WIDTH: 272,
    HEIGHT: 230
};

export const BANNER_APPROVAL_ACTIONS = {
    APPROVE: 'approve',
    REJECT: 'reject'
};

