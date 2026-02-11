import * as path from 'node:path';
import { promises as fs } from 'node:fs';

import type { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

type StoredRegistration = {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  email: string;
  message?: string;
  createdAt: string;
};

const registrationSchema = z.object({
  name: z.string().min(2, 'Нэрээ оруулна уу'),
  category: z.string().min(2, 'Ангилал оруулна уу'),
  city: z.string().min(2, 'Хот эсвэл аймгийг оруулна уу'),
  phone: z.string().min(5, 'Холбоо барих утас оруулна уу'),
  email: z.string().email('Зөв имэйл хаяг оруулна уу'),
  message: z.string().max(2000).optional(),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const dataDir = path.join(process.cwd(), 'tmp');
const registrationsFile = path.join(dataDir, 'registrations.json');
const sessionsFile = path.join(dataDir, 'admin-sessions.json');

async function appendJsonRecord<T extends { id: string }>(filePath: string, record: T) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  let existing: T[] = [];
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    existing = JSON.parse(raw) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  existing.push(record);
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf-8');
}

const registrationsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/registrations', async (request, reply) => {
    const payload = registrationSchema.parse(request.body);
    const record: StoredRegistration = {
      id: randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
    };

    await appendJsonRecord(registrationsFile, record);

    return reply.code(201).send({
      id: record.id,
      createdAt: record.createdAt,
    });
  });

  fastify.post('/admin/sessions', async (request, reply) => {
    const { email, password } = adminLoginSchema.parse(request.body);
    const expectedEmail = process.env.ADMIN_EMAIL ?? 'admin@yellbook.mn';
    const expectedPassword = process.env.ADMIN_PASSWORD ?? 'changeme';

    if (email !== expectedEmail || password !== expectedPassword) {
      return reply.status(401).send({ message: 'Нэвтрэх нэр эсвэл нууц үг буруу.' });
    }

    const session = {
      id: randomUUID(),
      email,
      createdAt: new Date().toISOString(),
    };

    await appendJsonRecord(sessionsFile, session);

    return reply.send({
      token: session.id,
      createdAt: session.createdAt,
      message: 'Амжилттай нэвтэрлээ. Та одоо админ самбарт нэвтэрч болно.',
    });
  });
};

export default registrationsRoute;
