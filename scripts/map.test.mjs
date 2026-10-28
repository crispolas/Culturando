import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventPoints } from '../src/lib/map/points.ts';
import { categories } from '../src/lib/events/categories.ts';

test('mapa inclui só eventos com local cadastrado e preserva longitude/latitude', () => {
  const events = [{ slug: 'ficticio-a', venue: 'teste' }, { slug: 'ficticio-b', venue: '' }, { slug: 'ficticio-c' }];
  const venues = [{ slug: 'teste', lat: -10.18, lng: -48.33 }];
  const data = eventPoints(events, venues);
  assert.equal(data.features.length, 1);
  assert.deepEqual(data.features[0].geometry.coordinates, [-48.33, -10.18]);
  assert.equal(data.features[0].properties.slug, 'ficticio-a');
  assert.equal(eventPoints([], venues).features.length, 0);
});

function luminance(hex) {
  const channels = hex.replace('#', '').match(/../g).map((value) => {
    const channel = parseInt(value, 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
test('texto de todas as categorias tem contraste AA de pelo menos 4,5:1', () => {
  for (const [name, palette] of Object.entries(categories)) {
    const values = [luminance(palette.color), luminance(palette.foreground)].sort((a, b) => b - a);
    const ratio = (values[0] + .05) / (values[1] + .05);
    assert.ok(ratio >= 4.5, `${name}: contraste ${ratio.toFixed(2)}:1`);
  }
});
