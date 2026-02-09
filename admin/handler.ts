import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { adminLoginBody, createAdminUserBody, editAdminUserBody, adminUserListingBody } from './type';
import bcrypt from "bcrypt";
import { generateAdminRefreshToken, signAdminAccessToken, verifyAdminRefreshToken, verifyAdminAccessToken } from '../utils/jwt';
import { createSuccessResponse,createPaginatedResponse } from '../utils/response';
import { APIError } from '../types/errors';
import { RefreshTokenStatus,ADMIN_ALLOWED_ROLES } from '../utils/constant';
import { AdminUser, AdminToken } from "../models/index"
import { ILike, In } from 'typeorm';

export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
  return {
    adminLoginHandler: async (
      request: FastifyRequest<{ Body: adminLoginBody }>,
      reply: FastifyReply,
    ) => {
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
            "User does not exist.Please check the username.",
          );
        }
        const isPasswordValid = await bcrypt.compare(
          password,
          adminUser.password,
        );
        if (!isPasswordValid) {
          throw new APIError(
            "Invalid password",
            401,
            "INVALID_PASSWORD",
            false,
            "The password  entered is incorrect.",
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
              1000,
        );
        adminToken.refreshToken = refreshToken;
        adminToken.accessToken = accessToken;
        adminToken.refreshTokenExpiry = refreshTokenExpiry;
        await adminTokenRepo.save(adminToken);
        const result = createSuccessResponse(
          { accessToken, refreshToken },
          "Login successful",
        );
        return reply.status(200).send(result);
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "LOGIN_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to Login. Please try again later.",
        );
      }
    },
    createAdminUserHandler: async (
      request: FastifyRequest<{ Body: createAdminUserBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userName, newRole, email, joiningDate } = request.body;

        const allowedRoles = ADMIN_ALLOWED_ROLES.map(
          (r) => Object.values(r)[0].value,
        );

        if (!allowedRoles.includes(newRole)) {
          throw new APIError(
            "Invalid role provided",
            400,
            "INVALID_ROLE",
            true,
            "Role is not allowed",
          );
        }

        const adminRepo = fastify.db.getRepository(AdminUser);

        const [{ nextval }] = await adminRepo.query(`
        SELECT nextval(pg_get_serial_sequence('"adminUser"', 'id'))
        `);

        const joiningDateObj = new Date(joiningDate);

        const day = String(joiningDateObj.getDate()).padStart(2, "0");
        const month = String(joiningDateObj.getMonth() + 1).padStart(2, "0");
        const empCode = `SHINR${Number(nextval) + 1}${day}${month}`;

        const defaultPassword = "Admin@123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const existingUser = await adminRepo.findOne({
          where: [{ email }],
        });

        if (existingUser) {
          throw new APIError(
            "User already exists",
            400,
            "USER_ALREADY_EXISTS",
            true,
            "User already exists",
          );
        }

        const NewAdminUser = await adminRepo.create({
          userName: userName,
          password: hashedPassword,
          role: newRole,
          email: email,
          empCode: empCode,
          joiningDate: joiningDate,
          isActive: true,
        });
        await adminRepo.save(NewAdminUser);

        const result = createSuccessResponse({
          data: NewAdminUser.empCode,
          Message: "Admin user created successfully",
        });
        return reply.status(200).send(result);
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "CREATE_ADMIN_USER_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to create admin user. Please try again later.",
        );
      }
    },
    adminRoleListingHandler: async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      try {
        const { page = 1, limit = 10 } = request.query as any;

        const adminRoles = ADMIN_ALLOWED_ROLES.map((r) => {
          const role = Object.values(r)[0];
          return {
            displayName: role.displayValue,
            value: role.value,
          };
        });

        reply
          .status(200)
          .send(
            createPaginatedResponse(adminRoles, adminRoles.length, page, limit),
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "ADMIN_ROLE_LISTING_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to fetch admin roles. Please try again later.",
        );
      }
    },
    editAdminUserHandler: async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      try {
        const { adminId } = request.query as any;

        const { userName, newRole, email, joiningDate } =
          request.body as editAdminUserBody;

        const adminRepo = fastify.db.getRepository(AdminUser);

        const adminUser = await adminRepo.findOne({
          where: { id: adminId, isActive: true },
        });
        if (!adminUser) {
          throw new APIError(
            "Bad Request",
            400,
            "INVALID_ID",
            false,
            "Invalid admin user id",
          );
        }

        if (userName) adminUser.userName = userName;
        if (newRole) adminUser.role = newRole;
        if (email) adminUser.email = email;
        if (joiningDate) adminUser.joiningDate = joiningDate;
        await adminRepo.save(adminUser);

        return reply
          .status(200)
          .send(
            createSuccessResponse(adminUser, "Admin user updated successfully"),
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "EDIT_ADMIN_USER_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to edit admin user. Please try again later.",
        );
      }
    },
    deleteAdminUserHandler: async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      try {
        const { adminId } = request.query as any;

        const adminRepo = fastify.db.getRepository(AdminUser);
        const adminUser = await adminRepo.findOne({
          where: { id: adminId, isActive: true },
        });
        if (!adminUser) {
          throw new APIError(
            "Bad Request",
            400,
            "INVALID_ID",
            false,
            "Invalid admin user id",
          );
        }
        adminUser.isActive = false;
        await adminRepo.save(adminUser);
        return reply
          .status(200)
          .send(
            createSuccessResponse(adminUser, "Admin user deleted successfully"),
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "DELETE_ADMIN_USER_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to delete admin user. Please try again later.",
        );
      }
    },
    singleAdminUserHandler: async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      try {
        const adminId = (request.params as any).id;

        const adminRepo = fastify.db.getRepository(AdminUser);

        const adminUser = await adminRepo.findOne({
          where: { id: adminId, isActive: true },
        });

        if (!adminUser) {
          throw new APIError(
            "Admin user not found",
            404,
            "ADMIN_USER_NOT_FOUND",
            false,
            "Admin user does not exist.",
          );
        }
        const response = {
          id: adminUser?.id,
          userName: adminUser?.userName,
          role: adminUser?.role,
          email: adminUser?.email,
          empCode: adminUser?.empCode,
          joiningDate: adminUser?.joiningDate,
        };
        reply
          .status(200)
          .send(
            createSuccessResponse(response, "Admin user fetched successfully"),
          );
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "SINGLE_USER_LISTING_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to fetch single user. Please try again later.",
        );
      }
    },
    adminUserListingHandler: async (
      request: FastifyRequest<{ Body: adminUserListingBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const search = (request.query as any).search;
        const {
          role,
          page = 1,
          limit = 10,
        } = request.body as adminUserListingBody || {};

        const adminRepo = fastify.db.getRepository(AdminUser);

        let where: any = { isActive: true };

        if (role && Array.isArray(role)) {
          where.role = In(role);
        }

        if (search) {
          where = [
            { ...where, userName: ILike(`%${search}%`) },
            { ...where, empCode: ILike(`%${search}%`) },
          ];
        }
        const [adminUsers, total] = await adminRepo.findAndCount({
          where: where,
          order: { id: "ASC" },
          take: limit,
          skip: (page - 1) * limit,
        });
        const response = adminUsers.map((a: any) => ({
          id: a.id,
          userName: a.userName,
          role: a.role,
          email: a.email,
          empCode: a.empCode,
          joiningDate: a.joiningDate,
        }));
        reply
          .status(200)
          .send(createPaginatedResponse(response, total, page, limit));
      } catch (error) {
        throw new APIError(
          (error as APIError).message,
          (error as APIError).statusCode || 400,
          (error as APIError).code || "ADMIN_USER_LISTING_FAILED",
          true,
          (error as APIError).publicMessage ||
            "Failed to fetch admin users. Please try again later.",
        );
      }
    },
  };
}