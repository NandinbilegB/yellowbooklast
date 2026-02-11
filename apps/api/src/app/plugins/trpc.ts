import fp from 'fastify-plugin';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

import { appRouter } from '../trpc/router';
import { createContext } from '../trpc/context';

const trpcPlugin = fp(async (fastify) => {
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });
});

export default trpcPlugin;