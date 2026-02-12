import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import vehicleRoutes from '../vehicle/routes';
import serviceRoutes from '../service/routes';
import bannerRoutes from '../banner/routes';
import adminLoginRoutes from '../admin/routes';
import fileRoutes from '../file/routes';
import rewardsRoutes from '../rewards/routes';
import vendorRoutes from '../vendor/routes';
import uploadsRoutes from './uploads';

export default async function routes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  fastify.get('/', async () => {
    return {
      message: 'Welcome to Shinr Admin  Management API',
      environment: process.env.NODE_ENV || 'development',
    };
  });
  fastify.register(uploadsRoutes);
  fastify.register(vehicleRoutes, { prefix: '/cars' });
  fastify.register(serviceRoutes,{prefix: '/service'});
  fastify.register(bannerRoutes, { prefix : '/banner'});
  fastify.register(adminLoginRoutes, { prefix: '/admin' });
  fastify.register(fileRoutes, { prefix: '/files' });
  fastify.register(rewardsRoutes, { prefix : '/rewards'});
  fastify.register(vendorRoutes, { prefix : '/vendor'});

}
