import {  jwtVerify } from "jose";

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET || "accesstokensecret");



export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });
  return payload as { userId: number; userUUId: string; deviceUUId: string; jti: string; tokenId: number};
}