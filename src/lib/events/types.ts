import type { events, venues } from '$lib/content/catalog.server';
export type Event = (typeof events)[number];
export type Venue = (typeof venues)[number];
