import { z } from 'zod';

export const OrganizationKindSchema = z.enum([
  'BUSINESS',
  'GOVERNMENT',
  'MUNICIPAL',
  'NGO',
  'SERVICE',
]);

const baseContactSchema = z.object({
  label: z.string().min(1).optional(),
});

export const PhoneContactSchema = baseContactSchema.extend({
  type: z.literal('phone'),
  value: z.string().min(3),
});

export const EmailContactSchema = baseContactSchema.extend({
  type: z.literal('email'),
  value: z.string().email(),
});

export const WebsiteContactSchema = baseContactSchema.extend({
  type: z.literal('website'),
  value: z.string().url(),
});

export const FacebookContactSchema = baseContactSchema.extend({
  type: z.literal('facebook'),
  value: z.string().url(),
});

export const InstagramContactSchema = baseContactSchema.extend({
  type: z.literal('instagram'),
  value: z.string().url(),
});

export const MapContactSchema = baseContactSchema.extend({
  type: z.literal('map'),
  value: z.string().url(),
});

export const ContactChannelSchema = z.discriminatedUnion('type', [
  PhoneContactSchema,
  EmailContactSchema,
  WebsiteContactSchema,
  FacebookContactSchema,
  InstagramContactSchema,
  MapContactSchema,
]);

export const YellowBookTagSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
});

export const YellowBookCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const AddressSchema = z.object({
  streetAddress: z.string().min(1),
  district: z.string().min(1),
  province: z.string().min(1),
});

export const CoordinatesSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    mapUrl: z.string().url().optional(),
  })
  .nullable();

export const YellowBookEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  shortName: z.string().nullable().optional(),
  summary: z.string().min(1),
  description: z.string().nullable().optional(),
  address: AddressSchema,
  contacts: z.array(ContactChannelSchema).min(1),
  category: YellowBookCategorySchema.pick({ id: true, name: true, slug: true }),
  tags: z.array(YellowBookTagSchema),
  organizationType: OrganizationKindSchema,
  hours: z.string().nullable().optional(),
  coordinates: CoordinatesSchema,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type OrganizationKind = z.infer<typeof OrganizationKindSchema>;
export type ContactChannel = z.infer<typeof ContactChannelSchema>;
export type YellowBookTag = z.infer<typeof YellowBookTagSchema>;
export type YellowBookCategory = z.infer<typeof YellowBookCategorySchema>;
export type YellowBookEntry = z.infer<typeof YellowBookEntrySchema>;