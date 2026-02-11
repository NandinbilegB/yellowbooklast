import cors from '@fastify/cors';
import fp from 'fastify-plugin';

const corsPlugin = fp(async (fastify) => {
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: false,
  });
});

export default corsPlugin;