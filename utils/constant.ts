
export const ALLOWED_ROLES:string[] = ["ADMIN", "SUPER_ADMIN", "EMPLOYEE"];

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
    EXPIRED:{ displayValue: 'Expired', value: 'EXPIRED' },
}

export  const BannerReviewStatus={
    APPROVED:{ displayValue: 'Approved', value: 'APPROVED' },
    REJECTED:{ displayValue: 'Rejected', value: 'REJECTED' },
    PENDING:{ displayValue: 'Pending', value: 'PENDING' },
}

 

export const BannerCategory = {
  FESTIVAL: { displayValue: 'Festival', value: 'FESTIVAL' },
  COME_BACK_USER: { displayValue: 'Come Back User', value: 'COME_BACK_USER' },
  MIN_CARWASH: { displayValue: 'Min Car Wash', value: 'MIN_CARWASH' }
} 