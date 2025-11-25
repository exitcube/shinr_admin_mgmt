
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
    ACTIVE:{ displayValue: 'ACTIVE', value: 'ACTIVE' },
    DRAFT:{ displayValue: 'DRAFT', value: 'DRAFT' },
    EXPIRED:{ displayValue: 'EXPIRED', value: 'EXPIRED' },
}

export  const BannerReviewStatus={
    APPROVED:{ displayValue: 'APPROVED', value: 'APPROVED' },
    REJECTED:{ displayValue: 'REJECTED', value: 'REJECTED' },
    PENDING:{ displayValue: 'PENDING', value: 'PENDING' },
}

export const BannerAudienceSelection=
{
    NEW_USER:{ displayValue: 'NEW USER', value: 'NEW_USER' },
    FIRST_CAR_WASH:{ displayValue: 'FIRST CAR WASH', value: 'FIRST_CAR_WASH' },
    FIRST_ANY_SERVICE:{ displayValue: 'FIRT ANY SERVICE', value: 'FIRST_ANY_SERVICE' },
}

export const BannerCategory = {
  FESTIVAL: { displayValue: 'FESTIVAL', value: 'FESTIVAL' },
  COME_BACK_USER: { displayValue: 'COMEBACK USER', value: 'COME_BACK_USER' },
  MIN_CARWASH: { displayValue: 'MIN CARWASH', value: 'MIN_CARWASH' }
} 