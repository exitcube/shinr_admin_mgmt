import { User } from './User';
import { UserDevice } from './UserDevice';
import { UserAddress } from './UserAddress';
import { Car } from './Cars';
import { CarMake } from './CarMake';
import { CarCategory } from './CarCategory';
import { AdminUser } from './AdminUser';
import { Banner } from './Banner';
import { Service } from './Service';
import { AdminToken } from './AdminToken';
// import { Product } from './Product';

// Export all entities as an array for TypeORM configuration
export const entities = [
    User,
    UserDevice,
    UserAddress,
    Car,
    CarCategory,
    CarMake,
    AdminUser,
    Banner,
    Service,
    AdminToken
];

// Entities owned by this microservice (managed by migrations here)
export const ownedEntities = [

        Car,
        CarCategory,
        CarMake,
        AdminUser,
        Banner,
        Service,
        AdminToken

];

// Export individual entities and types
export { User, type User as UserType } from './User';
export { UserDevice, type UserDevice as UserDeviceType } from './UserDevice';
export { UserAddress, type UserAddress as UserAddressType } from './UserAddress';
export { Car, type Car as CarType } from './Cars';
export { CarCategory, type CarCategory as CarCategoryType } from './CarCategory';
export { CarMake, type CarMake as CarMakeType } from './CarMake';
export { AdminUser,type AdminUser as AdminUserType} from './AdminUser'
export { Banner,type Banner as BannerType} from './Banner'
export { Service, type Service as ServiceType } from './Service';
export { AdminToken, type AdminToken as AdminTokenType } from './AdminToken';

