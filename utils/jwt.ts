import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";
import { accessTokenPayloadType} from "../types/config";
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET || "accesstokensecret");

// This handles the public and private key concept 
// Disabling for now for the sake of simplicity
// let privateKey: CryptoKey;
// let publicKey: CryptoKey;

// (async () => {
//   privateKey = await crypto.subtle.importKey(
//     "pkcs8",
//     Buffer.from(process.env.ACCESS_TOKEN_PRIVATE_KEY!, "base64"),
//     { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
//     false,
//     ["sign"]
//   );

//   publicKey = await crypto.subtle.importKey(
//     "spki",
//     Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY!, "base64"),
//     { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
//     false,
//     ["verify"]
//   );
// })();
// End of public and private key concept

export async function signAccessToken(payload : accessTokenPayloadType) {
  const jti = randomUUID();

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("15m") 
    .sign(ACCESS_TOKEN_SECRET);
}


export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });
  return payload as { userId: number; userUUId: string; deviceUUId: string; jti: string; tokenId: number};
}