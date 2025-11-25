import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";
import { adminAccessTokenPayloadType,  adminRefreshTokenPayloadType } from "../types/config";

const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET || "refreshtokensecret");
const REFRESH_TOKEN_EXPIRY_DAYS = process.env.REFRESH_TOKEN_EXPIRY_DAYS ? parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS) : 60;
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET || "accesstokensecret");

export async function verifyUserAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });
  return payload as { userId: number; userUUId: string; deviceUUId: string; jti: string; tokenId: number};
}

export async function generateAdminRefreshToken(payload : adminRefreshTokenPayloadType) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRY_DAYS}d`)
    .sign(REFRESH_TOKEN_SECRET);
}

export async function verifyAdminRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET, { algorithms: ["HS256"] });
  return payload as { tokenId : number,userId: number; userUUId: string;  jti: string };
}

export async function signAdminAccessToken(payload : adminAccessTokenPayloadType) {
  const jti = randomUUID();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("15m") 
    .sign(ACCESS_TOKEN_SECRET);
}


export async function verifyAdminAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });
  return payload as { userId: number; userUUId: string;  jti: string; tokenId: number,role:string};
}

