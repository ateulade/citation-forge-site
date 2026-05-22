import type { FAQPage, WithContext } from 'schema-dts';
import { z } from 'zod';

export const faqSchemaInput = z.object({
  items: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(1),
});

export type FaqSchemaInput = z.infer<typeof faqSchemaInput>;

export function buildFaqSchema(input: FaqSchemaInput): WithContext<FAQPage> {
  const parsed = faqSchemaInput.parse(input);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: parsed.items.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}
