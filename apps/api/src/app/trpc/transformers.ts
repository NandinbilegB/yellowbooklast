import type { Prisma } from '@prisma/client';

import { YellowBookCategorySchema, YellowBookEntrySchema } from '@lib/types';
import type { ContactChannel } from '@lib/types';

export const yellowBookEntryInclude = {
  category: true,
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.YellowBookEntryInclude;

type EntryWithRelations = Prisma.YellowBookEntryGetPayload<{
  include: typeof yellowBookEntryInclude;
}>;

export type { EntryWithRelations as YellowBookEntryWithRelations };

export function mapEntryToContract(entry: EntryWithRelations) {
  const contacts: ContactChannel[] = [];

  contacts.push({ type: 'phone', value: entry.phone, label: 'Утас' });

  if (entry.secondaryPhone) {
    contacts.push({ type: 'phone', value: entry.secondaryPhone, label: 'Нэмэлт утас' });
  }

  if (entry.email) {
    contacts.push({ type: 'email', value: entry.email, label: 'Имэйл' });
  }

  if (entry.website) {
    contacts.push({ type: 'website', value: entry.website, label: 'Вэб сайт' });
  }

  if (entry.facebook) {
    contacts.push({ type: 'facebook', value: entry.facebook, label: 'Facebook' });
  }

  if (entry.instagram) {
    contacts.push({ type: 'instagram', value: entry.instagram, label: 'Instagram' });
  }

  if (entry.googleMapUrl) {
    contacts.push({ type: 'map', value: entry.googleMapUrl, label: 'Газрын зураг' });
  }

  const coordinates =
    entry.latitude !== null && entry.latitude !== undefined && entry.longitude !== null && entry.longitude !== undefined
      ? {
          latitude: entry.latitude,
          longitude: entry.longitude,
          mapUrl: entry.googleMapUrl ?? undefined,
        }
      : null;

  const contractEntry = {
    id: entry.id,
    name: entry.name,
    shortName: entry.shortName,
    summary: entry.summary,
    description: entry.description,
    address: {
      streetAddress: entry.streetAddress,
      district: entry.district,
      province: entry.province,
    },
    contacts,
    category: {
      id: entry.category.id,
      name: entry.category.name,
      slug: entry.category.slug,
    },
    tags: entry.tags.map(({ tag }) => ({ id: tag.id, label: tag.label })),
    organizationType: entry.kind,
    hours: entry.hours,
    coordinates,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };

  return YellowBookEntrySchema.parse(contractEntry);
}

export function mapCategoryToContract(
  category: Prisma.YellowBookCategoryGetPayload<Prisma.YellowBookCategoryDefaultArgs>,
) {
  return YellowBookCategorySchema.parse({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  });
}