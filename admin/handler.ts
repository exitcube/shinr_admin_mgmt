import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { refreshRequestBody, adminLoginBody, createAdminUserBody } from './type';
import bcrypt from "bcrypt";
import { generateAdminRefreshToken, signAdminAccessToken, verifyAdminRefreshToken, verifyAdminAccessToken } from '../utils/jwt';
import { createSuccessResponse } from '../utils/response';
import { APIError } from '../types/errors';
import { RefreshTokenStatus } from '../utils/constant';
import { AdminUser, AdminToken } from "../models/index"

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
    adminLoginHandler: async (request: FastifyRequest<{ Body: adminLoginBody }>, reply: FastifyReply) => {
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
            "The password  entered is incorrect."
          );
        }
        await adminRepo.update({ id: adminUser.id }, { isActive: true });

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
          role: adminUser.role,
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
    createAdminUserHandler: async (request: FastifyRequest<{ Body: createAdminUserBody }>, reply: FastifyReply) => {
      try {
        const { role } = (request as any).user;
        if (role !== "SUPER_ADMIN") {
          throw new APIError(
            "Unauthorized",
            403,
            "UNAUTHORIZED",
            false,
            "You do not have permission to create admin users."
          );
        }
        const { userName, newRole, email } = request.body;

        const adminRepo = fastify.db.getRepository(AdminUser);

        const tempEmpCode = "TEMP";
        const joinDate = new Date();

        const defaultPassword = "Admin@123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const NewAdminUser = await adminRepo.create({
          userName: userName,
          password: hashedPassword,
          role: newRole,
          email: email,
          empCode: tempEmpCode,
          joiningDate: joinDate,
          isActive: true,
        });
        await adminRepo.save(NewAdminUser);

        const pk = NewAdminUser.id;
        const joiningDate = NewAdminUser.joiningDate;
        const day = String(joiningDate.getDate()).padStart(2, "0");
        const month = String(joiningDate.getMonth() + 1).padStart(2, "0");

        const empCode = `SHINR${pk}${day}${month}`;

        NewAdminUser.empCode = empCode;
        await adminRepo.save(NewAdminUser);

        const result = createSuccessResponse({ data: NewAdminUser.empCode, Message: "Admin user created successfully" });
        return reply.status(200).send(result);

      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "CREATE_ADMIN_USER_FAILED",
          true,
          (error as APIError).publicMessage || "Failed to create admin user. Please try again later."
        );
      }
    },
  };
}