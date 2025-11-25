
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
    ACTIVE:{ displayValue: 'active', value: 'ACTIVE' },
    DRAFT:{ displayValue: 'draft', value: 'DRAFT' },
    EXPIRED:{ displayValue: 'expired', value: 'EXPIRED' },
}

export  const BannerReviewStatus={
    APPROVED:{ displayValue: 'approved', value: 'APPROVED' },
    REJECTED:{ displayValue: 'rejected', value: 'REJECTED' },
    PENDING:{ displayValue: 'pending', value: 'PENDING' },
}

 

export const BannerCategory = {
  FESTIVAL: { displayValue: 'festival', value: 'FESTIVAL' },
  COME_BACK_USER: { displayValue: 'comeBackUser', value: 'COME_BACK_USER' },
  MIN_CARWASH: { displayValue: 'minCarWash', value: 'MIN_CARWASH' }
} 