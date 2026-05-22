import type { Article, FAQPage, WithContext } from 'schema-dts';
import { z } from 'zod';

const personSchema = z.object({
  name: z.string().min(1),
  url: z.url().optional(),
});

const faqEntrySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const articleSchemaInput = z.object({
  url: z.url(),
  headline: z.string().min(1).max(110),
  description: z.string().min(1).max(300),
  image: z.url().optional(),
  datePublished: z.coerce.date(),
  dateModified: z.coerce.date().optional(),
  author: personSchema,
  publisher: z
    .object({
      name: z.string().min(1),
      logo: z.url().optional(),
    })
    .default({ name: 'Citation Forge' }),
  keywords: z.array(z.string()).default([]),
  faq: z.array(faqEntrySchema).default([]),
});

export type ArticleSchemaInput = z.infer<typeof articleSchemaInput>;

export function buildArticleSchema(
  input: ArticleSchemaInput,
): Array<WithContext<Article> | WithContext<FAQPage>> {
  const parsed = articleSchemaInput.parse(input);

  const article: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: parsed.headline,
    description: parsed.description,
    url: parsed.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': parsed.url },
    datePublished: parsed.datePublished.toISOString(),
    dateModified: (parsed.dateModified ?? parsed.datePublished).toISOString(),
    author: { '@type': 'Person', name: parsed.author.name, url: parsed.author.url },
    publisher: {
      '@type': 'Organization',
      name: parsed.publisher.name,
      logo: parsed.publisher.logo
        ? { '@type': 'ImageObject', url: parsed.publisher.logo }
        : undefined,
    },
    image: parsed.image,
    keywords: parsed.keywords.length > 0 ? parsed.keywords.join(', ') : undefined,
  };

  const out: Array<WithContext<Article> | WithContext<FAQPage>> = [article];

  if (parsed.faq.length > 0) {
    const faq: WithContext<FAQPage> = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: parsed.faq.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      })),
    };
    out.push(faq);
  }

  return out;
}
