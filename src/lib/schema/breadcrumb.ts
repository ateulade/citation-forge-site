import type { BreadcrumbList, WithContext } from 'schema-dts';
import { z } from 'zod';

export const breadcrumbSchemaInput = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.url(),
      }),
    )
    .min(1),
});

export type BreadcrumbSchemaInput = z.infer<typeof breadcrumbSchemaInput>;

export function buildBreadcrumbSchema(
  input: BreadcrumbSchemaInput,
): WithContext<BreadcrumbList> {
  const parsed = breadcrumbSchemaInput.parse(input);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: parsed.items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.url,
    })),
  };
}
