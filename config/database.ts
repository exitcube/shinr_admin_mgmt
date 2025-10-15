import { DataSource, DataSourceOptions } from 'typeorm';
import { ENV } from './env';
import path from 'path';

// Import all entities from models index
import { entities } from '../models';


const baseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'shinr_user_mgmt',
    entities: entities,
    migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
    synchronize: false,
    logging: ENV.NODE_ENV === 'development',
    ssl: ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
        max: ENV.NODE_ENV === 'production' ? 20 : 10,
        min: ENV.NODE_ENV === 'production' ? 5 : 2,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
    },
};

// Development configuration
const developmentConfig: DataSourceOptions = {
    ...baseConfig,
    synchronize: false,
    logging: true,
    dropSchema: false,
};

// Production configuration
const productionConfig: DataSourceOptions = {
    ...baseConfig,
    synchronize: false,
    logging: false,
    ssl: { rejectUnauthorized: false },
    extra: {
        ...baseConfig.extra,
        max: 20,
        min: 5,
    },
};

// Test configuration
const testConfig: DataSourceOptions = {
    ...baseConfig,
    database: process.env.DB_NAME || 'shinr',
    synchronize: true,
    dropSchema: true,
    logging: false,
};

const getConfig = (): DataSourceOptions => {
    switch (ENV.NODE_ENV) {
        case 'production':
            return productionConfig;
        case 'test':
            return testConfig;
        case 'development':
        default:
            return developmentConfig;
    }
};

export const AppDataSource = new DataSource(getConfig());

// Initialize database connection
export const initializeDatabase = async (): Promise<DataSource> => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Database connection established successfully');
        }
        return AppDataSource;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};


export const closeDatabase = async (): Promise<void> => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('✅ Database connection closed');
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDatabase();
    process.exit(0);
});