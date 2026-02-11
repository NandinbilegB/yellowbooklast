import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import prisma from '../lib/prisma';

const CreateReviewSchema = z.object({
  yellowBookEntryId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(1).max(1000),
  userId: z.string().uuid().optional(),
});

const reviewsRoute: FastifyPluginAsync = async (fastify) => {
  // POST /reviews - Create a new review
  fastify.post('/reviews', async (request, reply) => {
    try {
      const data = CreateReviewSchema.parse(request.body);

      const review = await prisma.review.create({
        data: {
          yellowBookEntryId: data.yellowBookEntryId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          userId: data.userId || '00000000-0000-0000-0000-000000000000',
        },
        select: {
          id: true,
          createdAt: true,
          yellowBookEntryId: true,
          rating: true,
        },
      });

      return reply.status(201).send(review);
    } catch (error) {
      request.log.error({ err: error }, 'Failed to create review');
      return reply.status(400).send({ message: 'Unable to create review.' });
    }
  });

  // GET /reviews/:entryId - Get all reviews for an entry
  fastify.get<{ Params: { entryId: string } }>(
    '/reviews/:entryId',
    async (request, reply) => {
      try {
        const { entryId } = request.params;

        const reviews = await prisma.review.findMany({
          where: { yellowBookEntryId: entryId },
          orderBy: { createdAt: 'desc' },
        });

        return reply.send(reviews);
      } catch (error) {
        request.log.error({ err: error }, 'Failed to fetch reviews');
        return reply.status(400).send({ message: 'Unable to fetch reviews.' });
      }
    }
  );
};

export default reviewsRoute;
