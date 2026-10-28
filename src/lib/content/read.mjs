import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import { eventSchema, venueSchema, slugSchema, formatIssues } from './schema.mjs';

export async function readContent(root = 'content') {
  const errors = [];
  let rawVenues;
  try { rawVenues = JSON.parse(await readFile(join(root, 'venues.json'), 'utf8')); }
  catch (error) { throw new Error(`venues.json: não foi possível ler o JSON: ${error.message}`); }
  const venueResult = z.array(venueSchema, { error: 'deve ser uma lista de locais' }).safeParse(rawVenues);
  if (!venueResult.success) errors.push(...formatIssues('venues.json', venueResult.error.issues));
  const venues = venueResult.success ? venueResult.data : [];
  const seen = new Set();
  for (const [index, venue] of venues.entries()) {
    if (seen.has(venue.slug)) errors.push(`venues.json: campo '${index}.slug' está duplicado`);
    seen.add(venue.slug);
  }
  const events = [];
  const directories = await readdir(join(root, 'events'), { withFileTypes: true });
  for (const directory of directories.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!directory.isDirectory()) continue;
    const slug = directory.name;
    const file = `events/${slug}/index.md`;
    if (!slugSchema.safeParse(slug).success) errors.push(`${file}: campo 'slug' deve usar letras minúsculas sem acento, números e hífens`);
    let source;
    try { source = await readFile(join(root, file), 'utf8'); }
    catch { errors.push(`${file}: campo 'arquivo' não foi encontrado ou não pode ser lido`); continue; }
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
    if (!match) { errors.push(`${file}: campo 'frontmatter' deve estar entre duas linhas ---`); continue; }
    let metadata;
    try { metadata = parse(match[1]); }
    catch { errors.push(`${file}: campo 'frontmatter' contém YAML inválido`); continue; }
    const result = eventSchema.safeParse({ ...metadata, description: match[2].trim() });
    if (!result.success) { errors.push(...formatIssues(file, result.error.issues)); continue; }
    if (result.data.venue && !seen.has(result.data.venue)) errors.push(`${file}: campo 'venue' não existe em venues.json`);
    const files = await readdir(join(root, 'events', slug));
    const posters = files.filter((name) => /^cartaz\.(jpg|jpeg|png|webp|svg)$/.test(name));
    if (posters.length !== 1) errors.push(`${file}: campo 'cartaz' deve ter exatamente um arquivo cartaz.jpg, .jpeg, .png, .webp ou .svg`);
    events.push({ ...result.data, slug, posterPath: join(root, 'events', slug, posters[0] || '') });
  }
  if (errors.length) throw new Error(`Conteúdo inválido:\n${errors.join('\n')}`);
  events.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`) || a.slug.localeCompare(b.slug));
  return { events, venues };
}
