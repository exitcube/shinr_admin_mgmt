
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource;
    throwAPIError: (error: APIError) => never;
    config: {
      port: number;
      nodeEnv: string;
      appName: string;
    };

  }
}

declare module 'fastify' {
  interface FastifyRequest {
    deviceId?: string;
  }
}

export type accessTokenPayloadType = {
  userId: number;
  userUUId: string;
  deviceUUId: string;
  tokenId: number;
}

// Define interfaces for the return types
export interface UserInfo {
  id: number;
  uuid: string;
  name: string;
  email: string;
  mobile: string;
  isActive: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceInfo {
  id: number;
  uuid: string;
  userId: number;
  lastLogin: Date;
  lastActive: Date;
  userAgent: string;
  lastLogoutTime: Date;
  ipAddress: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDeviceData {
  user: UserInfo | null;
  device: DeviceInfo | null;
}

export interface AuthenticatedUser {
  userId: number;
  userUUId: string;
  deviceUUId: string;
  tokenId: number;
}