import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { LoginRequestBody, verifyOtpRequestBody, refreshRequestBody} from './type';
import { generateOtpToken, generateRefreshToken, signAccessToken, verifyOtpToken, verifyRefreshToken, verifyAccessToken } from '../utils/jwt';
import { generateOtp } from '../utils/helper';
import { createSuccessResponse } from '../utils/response';
import { APIError } from '../types/errors';
import { User, UserDevice, UserOtp, UserToken } from '../models';
import { RefreshTokenStatus } from '../utils/constant';
import userDevicePlugin from "../plugins/user";


export default function controller(fastify: FastifyInstance, opts: FastifyPluginOptions): any {
    return {
        generateOtpHandler: async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
            try {
                const { mobile } = request.body;

                // Create all the db repositories
                const userRepo = fastify.db.getRepository(User);
                const deviceRepo = fastify.db.getRepository(UserDevice);
                const userOtpRepo = fastify.db.getRepository(UserOtp);
                const userTokenRepo = fastify.db.getRepository(UserToken);


                let user = await userRepo.findOne({ where: { mobile, isActive: true } });
                if (!user) {
                    user = userRepo.create({
                        mobile,
                        isActive: true,
                        lastActive: new Date(),
                    });
                    await userRepo.save(user);
                }


                const existingDevice = await deviceRepo.findOne({
                    where: { userId: user.id, isActive: true },
                });
                if (existingDevice) {
                    await deviceRepo.remove(existingDevice);
                    // await userOtpRepo.delete({ userId: user.id, deviceId: existingDevice.id });
                    await userTokenRepo.update({ userId: user.id, deviceId: existingDevice.id }, { isActive: false, refreshTokenStatus: RefreshTokenStatus.INACTIVE });

                }


                const userAgent = request.headers["user-agent"] || "unknown";
                const ipAddress = request.ip || request.socket?.remoteAddress || "unknown";
                const userDevice = deviceRepo.create({
                    userId: user.id,
                    lastLogin: new Date(),
                    lastActive: new Date(),
                    userAgent,
                    ipAddress,
                });
                await deviceRepo.save(userDevice);


                user.lastActive = new Date();
                await userRepo.save(user);
                const otp = generateOtp();
                const userOtp = userOtpRepo.create({
                    userId: user.id,
                    deviceId: userDevice.id,
                    otp,
                    lastRequestedTime: new Date(),
                    requestCount: 1,
                    otpToken: ""
                });
                 await userOtpRepo.save(userOtp);
                const otpToken = await generateOtpToken({
                    // userId: user.id,
                    tokenId: userOtp.id,
                    userUUId: user.uuid,
                    deviceUUId: userDevice.uuid
                });
                userOtp.otpToken = otpToken;
                await userOtpRepo.save(userOtp);

                const result = createSuccessResponse({ otpToken }, "OTP generated");
                return reply.status(200).send(result);

            } catch (error) {
                throw new APIError(
                    (error as APIError).message,
                    500,
                    "OTP_GENERATION_FAILED",
                    true,
                    "Failed to generate OTP. Please try again later."
                );
            }
        },
        verifyOtpHandler: async (request: FastifyRequest<{ Body: verifyOtpRequestBody }>, reply: FastifyReply) => {
            try {
                const { otpToken, otp } = request.body;
                // Create all the db repositories
                const userRepo = fastify.db.getRepository(User);
                const userOtpRepo = fastify.db.getRepository(UserOtp);
                const userTokenRepo = fastify.db.getRepository(UserToken);
                

                // verify otp
                const payload = await verifyOtpToken(otpToken);
                console.log("payload", payload);
                if(request.deviceId !== payload.deviceUUId){
                    throw new APIError(
                        "Invalid device id",
                        400,
                        "INVALID_DEVICE_ID",
                        false,
                        "The device reqyuesting OTP verification does not match the device that requested the OTP. Please use the same device."
                    );
                }
                const user = await userRepo.findOne({
                    where: { uuid: payload.userUUId, isActive: true },
                    relations: ['device']
                });
                if (!user) {
                    throw new APIError(
                        "User not found",
                        400,
                        "USER_NOT_FOUND",
                        false,
                        "User does not exist. Please register."
                    );
                }
                const otpRecord = await userOtpRepo.findOne({
                    where: { id :payload.tokenId, userId: user.id, deviceId: user.device.id, isActive: true },
                });

                if (otpRecord?.otpToken !== otpToken) {
                    throw new APIError(
                        "Invalid OTP token",
                        400,
                        "INVALID_OTP_TOKEN",
                        false,
                        "The provided OTP token is invalid. Please login again."
                    );
                }
                const DEV_OTP = process.env.NODE_ENV === "development" ? process.env.DEV_OTP || "123456" : null;
                if (otp !== DEV_OTP && otpRecord?.otp !== otp) {
                    throw new APIError(
                        "Incorrect OTP",
                        400,
                        "INVALID_OTP",
                        false,
                        "The provided OTP is invalid. Please request a new OTP."
                    );
                }
                await userTokenRepo.update(
                    { userId: user.id, deviceId: user.device.id, isActive: true }, // condition
                    {
                        isActive: false,
                        refreshTokenStatus: RefreshTokenStatus.INACTIVE
                    } // update values
                );
                const userToken = userTokenRepo.create({
                    userId: user.id,
                    deviceId: user.device.id,
                    refreshTokenStatus: RefreshTokenStatus.ACTIVE,
                    isActive: true,
                    refreshToken: "",
                    accessToken: ""
                });

                await userTokenRepo.save(userToken);

                const refreshToken = await generateRefreshToken({ userUUId: user.uuid, deviceUUId: user.device.uuid, tokenId: userToken.id });
                const accessToken = await signAccessToken({ userId: user.id, userUUId: user.uuid, deviceUUId: user.device.uuid, tokenId: userToken.id});
                console.log(refreshToken, accessToken);
                const refreshTokenExpiry = new Date(Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || "60") * 24 * 60 * 60 * 1000);
                userToken.refreshToken = refreshToken;
                userToken.accessToken = accessToken;
                userToken.refreshTokenExpiry = refreshTokenExpiry;
                await userTokenRepo.save(userToken);
                otpRecord.isActive = false;
                await userOtpRepo.save(otpRecord);
                const result = createSuccessResponse({ accessToken, refreshToken }, "OTP verified and tokens generated");
                return reply.status(200).send(result);



            } catch (error) {
                throw new APIError(
                    (error as APIError).message,
                    (error as APIError).statusCode || 400,
                    (error as APIError).code || "OTP_VERIFICATION_FAILED",
                    true,
                    (error as APIError).publicMessage || "Failed to verify OTP. Please try again later."
                );
            }
        },
        resendOtpHandler: async (
          request: FastifyRequest<{ Body: { otpToken: string } }>,
          reply: FastifyReply
        ) => {
          try {
            const { otpToken } = request.body;
            const deviceId = request.deviceId;
            
            const userOtpRepo = fastify.db.getRepository(UserOtp);
    
            //  Verify and decode otpToken 
            const payload = await verifyOtpToken(otpToken);
            const { userUUId,deviceUUId,tokenId } = payload;
    
            // Ensure the request device matches the token device
            if (deviceId !== deviceUUId) {
              throw new APIError(
                "Invalid device id",
                400,
                "INVALID_DEVICE_ID",
                false,
                "The device requesting OTP resend does not match the device that requested the OTP."
              );
            }
    
            
            //  Find existing OTP record
            const otpRecord = await userOtpRepo.findOne({
              where: { id:tokenId, isActive: true },
            });
    
            // Ensure there is an active OTP flow
            if (!otpRecord) {
              throw new APIError(
                "No active OTP request",
                400,
                "NO_ACTIVE_OTP",
                false,
                "No active OTP found for this device. Please initiate login again."
              );
            }     
            //checking requestcount
            if (otpRecord.requestCount > 5) {
              otpRecord.isActive = false;
              await userOtpRepo.save(otpRecord);
              throw new APIError(
                "OTP limit exceeded",
                429,
                "OTP_LIMIT_EXCEEDED",
                false,
                "Too many OTP requests. Try again later."
              );
            }
            //  block resends within 45 seconds and 
            const secondsSinceLastRequest = Math.floor((Date.now() - new Date(otpRecord.lastRequestedTime).getTime()) / 1000);
            if (secondsSinceLastRequest < 45) {
              const waitSeconds = 45 - secondsSinceLastRequest;
              throw new APIError(
                "OTP resend cooldown",
                429,
                "OTP_RESEND_COOLDOWN",
                false,
               ` Please wait ${waitSeconds} seconds before requesting a new OTP.`
              );
            }
          
            //  Generate new OTP and new token
            const newOtp = generateOtp();
            const newOtpToken = await generateOtpToken({tokenId,userUUId,deviceUUId});

            //saving new otp records
              otpRecord.otp = newOtp;
              otpRecord.otpToken = newOtpToken;
              otpRecord.lastRequestedTime = new Date();
              otpRecord.requestCount += 1;
    
            await userOtpRepo.save(otpRecord);
    
            const result = createSuccessResponse(
              { otpToken: otpRecord.otpToken },
              "OTP resent successfully"
            );
            return reply.status(200).send(result);
          } catch (error) {
            throw new APIError(
              (error as APIError).message,
              (error as APIError).statusCode || 400,
              (error as APIError).code || "OTP_RESEND_FAILED",
              true,
              (error as APIError).publicMessage ||
                "Failed to resend OTP. Please try again later."
            );
          }
        }
        ,
        refreshTokenHandler: async (
          request: FastifyRequest<{ Body: refreshRequestBody }>,
          reply: FastifyReply
        ) => {
          try {
            const { refreshToken } = request.body;
            const deviceId = request.deviceId;

            const userTokenRepo = fastify.db.getRepository(UserToken);

            // Verify refresh token signature and expiry
            const payload: any = await verifyRefreshToken(refreshToken);
            const { userUUId, deviceUUId, tokenId } = payload;

            // request device matches token device
            if (deviceId !== deviceUUId) {
              throw new APIError(
                'Invalid device id',
                400,
                'INVALID_DEVICE_ID',
                false,
                'The device requesting token refresh does not match the device that owns the token.'
              );
            }

            
            const user = await fastify.getUserDeviceInfo({ userUUID: userUUId, deviceUUID: deviceUUId });
            if (!user) {
              throw new APIError('User not found', 400, 'USER_NOT_FOUND', false, 'User does not exist or is inactive.');
            }

            // Find the existing token record
            const existing = await userTokenRepo.findOne({ where: { id: tokenId, userId: user.id} });
            if (!existing) {
              throw new APIError('Refresh token not found', 400, 'REFRESH_TOKEN_NOT_FOUND', false, 'Invalid or inactive refresh token.');
            }
     
            // Ensure the refresh token matches the stored token 
            if (existing.refreshToken !== refreshToken) {
              throw new APIError('Refresh token mismatch', 400, 'REFRESH_TOKEN_MISMATCH', false, 'Provided refresh token does not match.');
            }

            // Ensure token is not already used/revoked
            if (existing.refreshTokenStatus !== RefreshTokenStatus.ACTIVE) {
              await userTokenRepo.update( { id: existing.id },{ refreshTokenStatus: RefreshTokenStatus.REVOKED });
              throw new APIError('Refresh token invalid state', 400, 'REFRESH_TOKEN_INVALID_STATE', false, 'Refresh token is not active.');
            }


            // Invalidate current token (rotate)
            existing.isActive = false;
            existing.refreshTokenStatus = RefreshTokenStatus.USED;
            await userTokenRepo.save(existing);

            // Create new user token row
            const newTokenRow = userTokenRepo.create({
              userId: user.id,
              deviceId: existing.deviceId,
              refreshTokenStatus: RefreshTokenStatus.ACTIVE,
              isActive: true,
              refreshToken: '',
              accessToken: ''
            });
            await userTokenRepo.save(newTokenRow);
            // new tokens
            const newRefreshToken = await generateRefreshToken({ tokenId: newTokenRow.id, userUUId: user.uuid, deviceUUId: deviceUUId });
            const newAccessToken = await signAccessToken({ userId: user.id, userUUId: user.uuid, deviceUUId: deviceUUId, tokenId: newTokenRow.id });

            // tokens and expiry
            const refreshTokenExpiry = new Date(Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '60') * 24 * 60 * 60 * 1000);
            newTokenRow.refreshToken = newRefreshToken;
            newTokenRow.accessToken = newAccessToken;
            newTokenRow.refreshTokenExpiry = refreshTokenExpiry;
            await userTokenRepo.save(newTokenRow);

            const result = createSuccessResponse({ accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Tokens refreshed');
            return reply.status(200).send(result);
          } catch (error) {
            throw new APIError(
              (error as APIError).message,
              (error as APIError).statusCode || 400,
              (error as APIError).code || 'TOKEN_REFRESH_FAILED',
              true,
              (error as APIError).publicMessage || 'Failed to refresh token. Please login again.'
            );
          }
        },
        logoutHandler: async (request: FastifyRequest, reply: FastifyReply) => {
          try {
              const { userUUId, deviceUUId,tokenId } = (request as any).user;
        
              
              const user = await fastify.getUserDeviceInfo({ userUUID: userUUId, deviceUUID: deviceUUId });
              if (!user) {
                  throw new APIError(
                      'User or device not found',
                      404,
                      'USER_OR_DEVICE_NOT_FOUND',
                      false,
                      'User or device does not exist or already logged out'
                  );
              }
        
              const userTokenRepo = fastify.db.getRepository(UserToken);
        
              await userTokenRepo.update(
                { id: tokenId,isActive: true },
                { isActive: false, refreshTokenStatus: RefreshTokenStatus.INACTIVE }
              );
     
              await fastify.db.getRepository(UserDevice).remove(user.device);
        
              return reply.status(200).send(createSuccessResponse({}, 'Logged out successfully'));
          } catch (error) {
              throw new APIError(
                  (error as APIError).message,
                  (error as APIError).statusCode || 500,
                  (error as APIError).code || 'LOGOUT_FAILED',
                  true,
                  (error as APIError).publicMessage || 'Failed to logout. Please try again later.'
              );
          }
        }
        
            
        }
    }
