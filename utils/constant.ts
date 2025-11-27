
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

export const TargetAudience = {
    MANUAL: { displayName: "Manual", value: "MANUAL" },
    EVERYONE: { displayName: "Everyone", value: "EVERYONE" },
    SPECIAL_RULE: { displayName: "Special Rules", value: "SPECIAL_RULE" }
};
export const Manual = {
    SELECTED_CUST: { displayName: "Selected Customer", value: "SELECTED_CUST" },
    LOCATION_BASED: { displayName: "Location Based", value: "LOCATION_BASED" },
};
export const SpecialRules = {
    NEW_USER: { displayName: "New User", value: "NEW_USER" },
    FIRST_CAR_WASH: { displayName: "First_Car_Wash", value: "FIRST_CAR_WASH" },
    FIRST_ANY_SERVICE: { displayName: "First_Any_Service", value: "FIRST_ANY_WASH" }

};