import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { readContent } from '../src/lib/content/read.mjs';
import { eventSchema, dateSchema } from '../src/lib/content/schema.mjs';
import { isCurrent, localDate } from '../src/lib/content/dates.ts';

const sample = { title: 'Exemplo fictício de teste', category: 'música', date: '2028-02-29', time: '19:00', venue: '' };
async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'semnome-content-'));
  await mkdir(join(root, 'events', 'exemplo'), { recursive: true });
  await writeFile(join(root, 'venues.json'), '[]');
  async function write(metadata = sample, poster = true) {
    await writeFile(join(root, 'events/exemplo/index.md'), `---\n${stringify(metadata)}---\n\nDescrição de teste.`);
    if (poster) await writeFile(join(root, 'events/exemplo/cartaz.svg'), '<svg/>');
  }
  try { await run(root, write); }
  finally { await rm(root, { recursive: true, force: true }); }
}

test('calendário rejeita dias inexistentes e hora fora da faixa', () => {
  assert.equal(dateSchema.safeParse('2027-02-29').success, false);
  assert.equal(dateSchema.safeParse('2028-02-29').success, true);
  assert.equal(dateSchema.safeParse('2027-13-01').success, false);
  assert.equal(eventSchema.safeParse({ ...sample, description: 'Texto', time: '24:00' }).success, false);
  assert.equal(eventSchema.safeParse({ ...sample, description: 'Texto', endDate: '2028-02-28' }).success, false);
  assert.equal(eventSchema.safeParse({ ...sample, description: 'Texto', link: 'javascript:alert(1)' }).success, false);
});

test('eventos sem local ou online são aceitos, sem inventar coordenadas', async () => {
  await fixture(async (root, write) => {
    for (const venue of ['', null, undefined]) {
      await write({ ...sample, venue });
      const content = await readContent(root);
      assert.equal(content.events.length, 1);
      assert.equal(content.venues.length, 0);
    }
  });
});

test('erros indicam arquivo e campo em português', async () => {
  await fixture(async (root, write) => {
    await write({ ...sample, date: 'amanhã' });
    await assert.rejects(readContent(root), /events\/exemplo\/index.md: campo 'date' deve ter o formato AAAA-MM-DD/);
    await write({ ...sample, venue: 'nao-existe' });
    await assert.rejects(readContent(root), /campo 'venue' não existe/);
  });
});

test('local único é reutilizável e slugs duplicados são rejeitados', async () => {
  await fixture(async (root, write) => {
    const venue = { slug: 'teste', nome: 'Local fictício de teste', endereço: 'Endereço fictício', lat: -10.18, lng: -48.33 };
    await write({ ...sample, venue: 'teste' });
    await writeFile(join(root, 'venues.json'), JSON.stringify([venue]));
    assert.equal((await readContent(root)).events[0].venue, 'teste');
    await writeFile(join(root, 'venues.json'), JSON.stringify([venue, venue]));
    await assert.rejects(readContent(root), /slug' está duplicado/);
    await writeFile(join(root, 'venues.json'), JSON.stringify([{ ...venue, lat: 100 }]));
    await assert.rejects(readContent(root), /campo '0.lat' está acima/);
  });
});

test('cartaz ausente e YAML inválido falham', async () => {
  await fixture(async (root, write) => {
    await write(sample, false);
    await assert.rejects(readContent(root), /campo 'cartaz'/);
    await writeFile(join(root, 'events/exemplo/index.md'), '---\ntitle: [\n---\nTexto');
    await assert.rejects(readContent(root), /frontmatter' contém YAML inválido/);
  });
});

test('agenda expira na meia-noite de Palmas, inclusive eventos de vários dias', () => {
  const event = { date: '2026-10-28' };
  assert.equal(localDate(new Date('2026-10-29T02:59:59Z')), '2026-10-28');
  assert.equal(isCurrent(event, new Date('2026-10-29T02:59:59Z')), true);
  assert.equal(isCurrent(event, new Date('2026-10-29T03:00:00Z')), false);
  assert.equal(isCurrent({ ...event, endDate: '2026-10-30' }, new Date('2026-10-30T18:00:00Z')), true);
});
