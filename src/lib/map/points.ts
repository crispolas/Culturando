import type { Event, Venue } from '$lib/events/types';
export function eventPoints(events: Event[], venues: Venue[]) {
  return {
    type: 'FeatureCollection' as const,
    features: events.flatMap((event) => {
      const venue = venues.find((place) => place.slug === event.venue);
      return venue ? [{ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [venue.lng, venue.lat] }, properties: { slug: event.slug } }] : [];
    })
  };
}
