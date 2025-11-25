
export type CreateBannerBody = {
    text?: string;
    bgColour?: string;
    bgImageId?: string;
    buttonText: string;
    targetValue: string;
}
export type UpdateBannerBody = {
    text?: string;
    bgColour?: string;
    bgImageId?: string;
    buttonText?: string;
    targetValue?: string;
}

export type BannerFilterBody=
{
      vendorId?:number;
      reviewStatus?:string,
      status?:string,
      startTime?:string,
      endTime?:string,
      searchByCategory?:string,
      limit?:number,
      page?:number,
      sortOrder?:"ASC" | "DESC" | "asc" | "desc";
}