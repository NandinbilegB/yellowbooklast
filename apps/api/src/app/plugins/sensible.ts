import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';

/**
 * This plugin adds handy utilities for handling HTTP errors.
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function sensiblePlugin(fastify: FastifyInstance) {
  fastify.register(sensible);

});