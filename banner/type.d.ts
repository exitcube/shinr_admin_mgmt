
export type createBannerBody = {
    title:string;
    text?: string;
    bgColour?: string;
    bgImageId?: string;
    buttonText?: string;
    buttonColour?:String;
    category?:string;//festival | comebackuser | minimum wash
    vendorId?:string;
    owner?:string;
    homePageView?:boolean;
    displaySequence?:string;
    targetAudience?:string; //EVERYONE | MANUAL | SPECIAL_RULE 
    targetValue?: string;
    startTime?:string;
    endTime?:string;
    audienceSelection?:string //newUser|first carwash|first any service
}

 