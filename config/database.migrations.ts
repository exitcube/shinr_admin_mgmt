import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ENV } from './env';
import { ownedEntities } from '../models';

const baseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'shinr_user_mgmt',
    entities: ownedEntities,
    migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
    synchronize: false,
    logging: ENV.NODE_ENV === 'development',
};

export default new DataSource(baseConfig);



