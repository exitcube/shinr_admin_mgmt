export type LoginRequestBody = {
  mobile : string;
};
export type verifyOtpRequestBody = {
  otpToken: string;
  otp: string;
};

export type refreshRequestBody = {
  refreshToken: string;
};