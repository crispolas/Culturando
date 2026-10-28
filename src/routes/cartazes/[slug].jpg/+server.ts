import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import { events, posterPaths } from '$lib/content/catalog.server';
import type { RequestHandler } from './$types';

export const prerender = true;
export const trailingSlash = 'never';
export function entries() { return events.map(({ slug }) => ({ slug })); }
export const GET: RequestHandler = async ({ params }) => {
  const path = posterPaths.get(params.slug);
  if (!path) error(404, 'Cartaz não encontrado');
  const image = await sharp(path).resize({ width: 1000, withoutEnlargement: true }).flatten({ background: '#F3EEE4' }).jpeg({ quality: 82 }).toBuffer();
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/jpeg' } });
};
