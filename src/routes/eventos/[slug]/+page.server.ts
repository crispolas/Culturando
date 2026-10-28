import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { base } from '$app/paths';
import { events, venues } from '$lib/content/catalog.server';
import type { PageServerLoad } from './$types';

export function entries() { return events.map(({ slug }) => ({ slug })); }
export const load: PageServerLoad = ({ params }) => {
  const event = events.find((item) => item.slug === params.slug);
  if (!event) error(404, 'Evento não encontrado');
  const origin = (env.PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
  return {
    event, venue: venues.find((item) => item.slug === event.venue) || null,
    canonical: `${origin}${base}/eventos/${event.slug}/`,
    image: `${origin}${base}/cartazes/${event.slug}.jpg`
  };
};
