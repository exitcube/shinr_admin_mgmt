import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import {  refreshRequestBody,adminLoginBody} from './type';
import bcrypt from "bcrypt";
import {  generateAdminRefreshToken, signAdminAccessToken,  verifyAdminRefreshToken, verifyAdminAccessToken } from '../utils/jwt';
import { createSuccessResponse } from '../utils/response';
import { APIError } from '../types/errors';
import { RefreshTokenStatus } from '../utils/constant';
import {AdminUser,AdminToken } from "../models/index"

export default function controller( fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
    adminLoginHandler: async (request: FastifyRequest<{ Body: adminLoginBody }>,reply: FastifyReply ) => {
      try {
        const { userName, password } = request.body;

        const adminRepo = fastify.db.getRepository(AdminUser);
        const adminTokenRepo = fastify.db.getRepository(AdminToken);

        const adminUser = await adminRepo.findOneBy({ userName: userName });
        if (!adminUser) {
          throw new APIError(
            "User not found",
            400,
            "USER_NOT_FOUND",
            false,
            "User does not exist.Please check the username."
          );
        }
        const isPasswordValid = await bcrypt.compare(
          password,
          adminUser.password
        );
        if (!isPasswordValid) {
          throw new APIError(
            "Invalid password",
            401,
            "INVALID_PASSWORD",
            false,
            "The password you entered is incorrect."
          );
        }

        const adminToken = adminTokenRepo.create({
          userId: adminUser.id,
          refreshTokenStatus: RefreshTokenStatus.ACTIVE,
          isActive: true,
          refreshToken: "",
          accessToken: "",
        });
        await adminTokenRepo.save(adminToken);
        const refreshToken = await generateAdminRefreshToken({
          userUUId: adminUser.uuid,
          tokenId: adminToken.id,
        });
        const accessToken = await signAdminAccessToken({
          userId: adminUser.id,
          userUUId: adminUser.uuid,
          tokenId: adminToken.id,
        });
        const refreshTokenExpiry = new Date(
          Date.now() +
            parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || "60") *
              24 *
              60 *
              60 *
              1000
        );
        adminToken.refreshToken = refreshToken;
        adminToken.accessToken = accessToken;
        adminToken.refreshTokenExpiry = refreshTokenExpiry;
        await adminTokenRepo.save(adminToken);
        const result = createSuccessResponse(
          { accessToken, refreshToken },
          "Login successful"
        );
        return reply.status(200).send(result);
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "LOGIN_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to Login. Please try again later."
        );
      }
    },
  };
}