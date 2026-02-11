import { Prisma } from '@prisma/client';
import { initTRPC, TRPCError } from '@trpc/server';

import type { Context } from './context';
import { listInputSchema, detailInputSchema } from './schemas';
import {
  mapCategoryToContract,
  mapEntryToContract,
  yellowBookEntryInclude,
  type YellowBookEntryWithRelations,
} from './transformers';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  yellowBook: t.router({
    list: t.procedure.input(listInputSchema).query(async ({ ctx, input }) => {
      const entries = (await ctx.prisma.yellowBookEntry.findMany({
        where: {
          ...(input.categorySlug
            ? {
                category: {
                  slug: input.categorySlug,
                },
              }
            : {}),
          ...(input.organizationType ? { kind: input.organizationType } : {}),
          ...(input.tag
            ? {
                tags: {
                  some: {
                    tag: {
                      label: {
                        contains: input.tag,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  },
                },
              }
            : {}),
          ...(input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: Prisma.QueryMode.insensitive } },
                  { shortName: { contains: input.search, mode: Prisma.QueryMode.insensitive } },
                  { summary: { contains: input.search, mode: Prisma.QueryMode.insensitive } },
                  { description: { contains: input.search, mode: Prisma.QueryMode.insensitive } },
                  { streetAddress: { contains: input.search, mode: Prisma.QueryMode.insensitive } },
                  { district: { contains: input.search, mode: Prisma.QueryMode.insensitive } },
                  { province: { contains: input.search, mode: Prisma.QueryMode.insensitive } },
                ],
              }
            : {}),
        },
        include: yellowBookEntryInclude,
        orderBy: [{ name: 'asc' }],
      })) as YellowBookEntryWithRelations[];

      return entries.map((entry) => mapEntryToContract(entry));
    }),
    categories: t.procedure.query(async ({ ctx }) => {
      const categories = await ctx.prisma.yellowBookCategory.findMany({
        orderBy: { name: 'asc' },
      });

      return categories.map(mapCategoryToContract);
    }),
    detail: t.procedure.input(detailInputSchema).query(async ({ ctx, input }) => {
      const entry = await ctx.prisma.yellowBookEntry.findUnique({
        where: { id: input.id },
        include: yellowBookEntryInclude,
      });

      if (!entry) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Байгууллага олдсонгүй.' });
      }

      return mapEntryToContract(entry);
    }),
  }),
});
export type AppRouter = typeof appRouter;