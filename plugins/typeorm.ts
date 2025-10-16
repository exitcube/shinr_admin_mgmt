import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { DataSource } from 'typeorm';
import { initializeDatabase, closeDatabase } from "../config/database"



const typeormPlugin: FastifyPluginAsync = async (fastify) => {
  try {
    // Initialize database connection
    const dataSource = await initializeDatabase();
    
    // Decorate fastify with database instance
    fastify.decorate('db', dataSource);
    
    // Add hook to close database on app close
    fastify.addHook('onClose', async () => {
      await closeDatabase();
    });
    
    console.log('✅ TypeORM plugin registered successfully');
  } catch (error) {
    console.error('❌ Failed to register TypeORM plugin:', error);
    throw error;
  }
};

export default fp(typeormPlugin, {
  name: 'typeorm'
});