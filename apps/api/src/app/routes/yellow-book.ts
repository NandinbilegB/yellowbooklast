import type { FastifyPluginAsync } from 'fastify';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import prisma from '../lib/prisma';
import {
  mapCategoryToContract,
  mapEntryToContract,
  yellowBookEntryInclude,
  type YellowBookEntryWithRelations,
} from '../trpc/transformers';
import { listInputSchema } from '../trpc/schemas';

const listQuerySchema = listInputSchema.partial();

const yellowBooksRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/yellow-books', async (request) => {
    const query = listQuerySchema.parse(request.query);

    const entries = (await prisma.yellowBookEntry.findMany({
      where: {
        ...(query.categorySlug
          ? {
              category: {
                slug: query.categorySlug,
              },
            }
          : {}),
        ...(query.organizationType ? { kind: query.organizationType } : {}),
        ...(query.tag
          ? {
              tags: {
                some: {
                  tag: {
                    label: {
                      contains: query.tag,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              },
            }
          : {}),
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
                { shortName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
                { summary: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
                { streetAddress: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
                { district: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
                { province: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {}),
      },
      include: yellowBookEntryInclude,
      orderBy: [{ name: 'asc' }],
    })) as YellowBookEntryWithRelations[];

    return entries.map((entry) => mapEntryToContract(entry));
  });

  fastify.get('/yellow-books/:id', async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(request.params);

    const entry = await prisma.yellowBookEntry.findUnique({
      where: { id },
      include: yellowBookEntryInclude,
    });

    if (!entry) {
      return reply.status(404).send({ message: 'Байгууллага олдсонгүй.' });
    }

    return mapEntryToContract(entry);
  });

  fastify.get('/yellow-books/categories', async () => {
    const categories = await prisma.yellowBookCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return categories.map((category) => mapCategoryToContract(category));
  });
};

export default yellowBooksRoute;