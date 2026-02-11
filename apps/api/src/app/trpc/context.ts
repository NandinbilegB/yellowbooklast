import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

import prisma from '../lib/prisma';

export function createContext({ req, res }: CreateFastifyContextOptions) {

  return {
    req,
    res,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;