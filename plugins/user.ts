import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { User } from '../models/User';
import { DataSource } from 'typeorm';
import { validate as isUUID } from 'uuid';

interface UserDeviceParams {
  userUUID?: string;
  userId?: number;
  deviceUUID?: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource;
    getUserDeviceInfo: (params: UserDeviceParams) => Promise<User | null>;
  }
}

const userDevicePlugin: FastifyPluginAsync = async (fastify) => {
  try {
    fastify.decorate(
      'getUserDeviceInfo',
      async ({ userUUID, userId, deviceUUID }: UserDeviceParams) => {
        
        if (!userUUID && !userId) {
          throw new Error('Either userUUID or userId is required');
        }

        const userRepo = fastify.db.getRepository(User);

        
        const where: any = { isActive: true };
        if (userUUID) {
          if (!isUUID(userUUID)) throw new Error('Invalid userUUID format');
          where.uuid = userUUID;
        } else if (userId) {
          where.id = userId;
        }

        if (deviceUUID) {
          where.device = { uuid: deviceUUID, isActive: true };
        }

        // Fetch user + device relation
        const user = await userRepo.findOne({
          where,
          relations: ['device'], // fetch user and related device data
        });        

        return user;
      }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export default fp(userDevicePlugin, { name: 'userDevicePlugin' });
