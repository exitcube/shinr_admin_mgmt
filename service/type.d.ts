export type addServicesBody = {
    name: string;
    displayName: string;
    imageId: string;
    targetValue: string;
}

export type updateServicesBody = {
    name?: string;
    displayName?: string;
    imageId?: string;
    targetValue?: string;
}