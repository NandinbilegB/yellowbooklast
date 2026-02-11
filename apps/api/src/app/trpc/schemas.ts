import { z } from 'zod';

import { OrganizationKindSchema } from '@lib/types';

export const listInputSchema = z.object({
  search: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  organizationType: OrganizationKindSchema.optional(),
  tag: z.string().trim().optional(),
});

export const detailInputSchema = z.object({
  id: z.string().uuid(),
});