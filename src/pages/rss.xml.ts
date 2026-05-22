import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data, id }) => {
    if (data.draft) return false;
    if (id.startsWith('_fixtures/')) return false;
    return true;
  });

  return rss({
    title: 'Citation Forge',
    description: 'AEO production playbook + product updates.',
    site: context.site ?? 'https://citationforge.com',
    items: posts
      .sort(
        (a, b) =>
          (b.data.publishDate?.getTime() ?? 0) -
          (a.data.publishDate?.getTime() ?? 0),
      )
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.publishDate,
        link: `/blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
      })),
  });
}
