
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

export enum BannerStatus{
    ACTIVE='ACTIVE',
    DRAFT='DRAFT',
    EXPIRED='EXPIRED'
}

export enum BannerReviewStatus{
    APPROVED='APPROVED',
    REJECTED='REJECTED',
    PENDING='PENDING'
}

export enum BannerAudienceSelection
{
    NEW_USER="NEW_USER",
    FIRST_CAR_WASH="FIRST_CAR_WASH",
    FIRST_ANY_SERVICE="FIRST_ANY_SERVICE"
}

export enum BannerCategory
{
    FESTIVAL='FESTIVAL',
    COME_BACK_USER='COME_BACK_USER',
    MIN_CARWASH='MIN_CARWASH'
}
