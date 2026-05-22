import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const faqEntry = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const expertQuote = z.object({
  text: z.string().min(1),
  attribution: z.string().min(1),
  role: z.string().min(1),
});

const proprietaryDataPoint = z.object({
  stat: z.string().min(1),
  source: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
});

const blogFrontmatter = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(40).max(180),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  faq: z.array(faqEntry).default([]),
  expertQuote: expertQuote.optional(),
  proprietaryData: z.array(proprietaryDataPoint).default([]),
  relatedPages: z.array(z.string()).default([]),
  priorityPrompt: z.string().min(1),
  draft: z.boolean().default(false),
  generated: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatter>;

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: blogFrontmatter,
});

export const collections = { blog };
