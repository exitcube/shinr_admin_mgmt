import { User } from './User';
import { UserOtp } from './UserOtp';
import { UserToken } from './UserToken';
import { UserDevice } from './UserDevice';
import { UserAddress } from './UserAddress';
// import { Product } from './Product';

// Export all entities as an array for TypeORM configuration
export const entities = [
    User,
    UserOtp,
    UserToken,
    UserDevice,
    UserAddress
];

// Entities owned by this microservice (managed by migrations here)
export const ownedEntities = [
    User,
    UserDevice,
];

// Export individual entities and types
export { User, type User as UserType } from './User';
export { UserOtp, type UserOtp as UserOtpType } from './UserOtp';
export { UserToken, type UserToken as UserTokenType } from './UserToken';
export { UserDevice, type UserDevice as UserDeviceType } from './UserDevice';
export { UserAddress, type UserAddress as UserAddressType } from './UserAddress';

