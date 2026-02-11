import helmet from '@fastify/helmet';
import fp from 'fastify-plugin';

const securityPlugin = fp(async (fastify) => {
  await fastify.register(helmet, {
    global: true,
  });
});

export default securityPlugin;