export type refreshRequestBody = {
  refreshToken: string;
};

export type adminLoginBody={
    userName:string;
    password:string;
}

export type createAdminUserBody={
    userName:string;
    newRole:string;
    email:string;
    joiningDate: Date;
}
