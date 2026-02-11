import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => ({ status: 'ok' }));
};

export default root;