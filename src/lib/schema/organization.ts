import type { Organization, WithContext } from 'schema-dts';
import { z } from 'zod';

export const organizationSchemaInput = z.object({
  name: z.string().min(1).default('Citation Forge'),
  url: z.url().default('https://citationforge.com'),
  logo: z.url().optional(),
  description: z.string().min(1).max(300),
  sameAs: z.array(z.url()).default([]),
  contactPoint: z
    .object({
      email: z.email(),
      contactType: z.string().default('customer support'),
    })
    .optional(),
});

export type OrganizationSchemaInput = z.infer<typeof organizationSchemaInput>;

export function buildOrganizationSchema(
  input: Partial<OrganizationSchemaInput> & Pick<OrganizationSchemaInput, 'description'>,
): WithContext<Organization> {
  const parsed = organizationSchemaInput.parse(input);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: parsed.name,
    url: parsed.url,
    logo: parsed.logo,
    description: parsed.description,
    sameAs: parsed.sameAs.length > 0 ? parsed.sameAs : undefined,
    contactPoint: parsed.contactPoint
      ? {
          '@type': 'ContactPoint',
          email: parsed.contactPoint.email,
          contactType: parsed.contactPoint.contactType,
        }
      : undefined,
  };
}
