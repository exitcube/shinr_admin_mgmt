export type createServiceBody = {
    name: string;
    displayName: string;
    description: string;
    displaySequence: number;
    status: string;
    imageId: string;
}

export type updateServiceBody = {
    name?: string;
    displayName?: string;
    description?: string;
    displaySequence?: number;
    status?: string;
    imageId?: string;
}
export type listServiceBody = {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortOrder?: 'ASC' | 'DESC';
}