import { readContent } from './read.mjs';
import MarkdownIt from 'markdown-it';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const markdown = new MarkdownIt({ html: false, linkify: false });
const content = await readContent();
export const venues = content.venues;
export const events = await Promise.all(content.events.map(async ({ posterPath, ...event }) => {
  let dimensions;
  let posterRevision;
  try {
    const image = await readFile(posterPath);
    dimensions = await sharp(image).metadata();
    posterRevision = createHash('sha256').update(image).digest('hex').slice(0, 12);
  }
  catch (cause) { throw new Error(`events/${event.slug}/index.md: campo 'cartaz' não contém uma imagem válida`, { cause }); }
  const posterWidth = Math.min(dimensions.width || 1000, 1000);
  const posterHeight = Math.round(posterWidth * (dimensions.height || 1250) / (dimensions.width || 1000));
  return {
    ...event, posterWidth, posterHeight, posterRevision, posterIsPhoto: !posterPath.endsWith('.svg'),
    html: markdown.render(event.description),
    summary: event.description.replace(/[#*_`\[\]]/g, '').replace(/\s+/g, ' ').slice(0, 180)
  };
}));
export const posterPaths = new Map(content.events.map((event) => [event.slug, event.posterPath]));
