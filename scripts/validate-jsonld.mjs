#!/usr/bin/env node
/**
 * Minimal JSON-LD validator for the build output.
 *
 * Walks `dist/` for .html files, extracts every <script type="application/ld+json">,
 * and verifies each block parses to an object with `@type` (and `@context` after merge).
 * Fails the build on parse errors or missing required fields.
 *
 * Not a substitute for Google's Rich Results Test — but it catches the silent
 * regressions you'd otherwise only see in production.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist/client';
const errors = [];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.name.endsWith('.html')) {
      yield path;
    }
  }
}

const SCRIPT_RE =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

async function main() {
  try {
    await stat(DIST);
  } catch {
    console.error(`No ${DIST}/ directory found — run \`pnpm run build\` first.`);
    process.exit(1);
  }

  let pages = 0;
  let blocks = 0;

  for await (const file of walk(DIST)) {
    pages += 1;
    const html = await readFile(file, 'utf8');
    const matches = html.matchAll(SCRIPT_RE);
    for (const match of matches) {
      blocks += 1;
      const raw = match[1]
        .replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>')
        .replace(/\\u0026/g, '&')
        .trim();
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (!item || typeof item !== 'object') {
            errors.push(`${file}: JSON-LD block is not an object`);
          } else if (!item['@type']) {
            errors.push(`${file}: JSON-LD missing @type`);
          } else if (!item['@context']) {
            errors.push(`${file}: JSON-LD missing @context (type=${item['@type']})`);
          }
        }
      } catch (err) {
        errors.push(`${file}: invalid JSON-LD — ${err.message}`);
      }
    }
  }

  console.log(`Scanned ${pages} HTML page(s), ${blocks} JSON-LD block(s).`);

  if (errors.length > 0) {
    console.error('JSON-LD validation failed:');
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log('JSON-LD validation passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
