import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { audit } from './audit.mjs';

test('auditoria rejeita todas as famílias proibidas e identifica linha e arquivo', async () => {
  const root = await mkdtemp(join(tmpdir(), 'semnome-audit-'));
  const forbidden = ['on:click=', 'export let', '$:', 'createEventDispatcher', '<slot', 'backdrop-filter', 'background-clip: text', 'linear-gradient(', 'radial-gradient(', 'conic-gradient(', 'Inter', 'Roboto', 'Arial', 'Geist', 'Space Grotesk', 'Poppins', 'system-ui', '\u{1F600}', '\u{1F1E7}\u{1F1F7}', 'Descubra', 'Explore', 'Eleve', 'Transforme', 'TODO', 'FIXME', 'any'];
  try {
    for (const source of forbidden) {
      await writeFile(join(root, 'fixture.svelte'), `\n${source}`);
      const failures = await audit(root);
      assert.ok(failures.length > 0, `Não detectou: ${source}`);
      assert.ok(failures[0].includes('fixture.svelte:2:'));
    }
    await writeFile(join(root, 'fixture.svelte'), 'let value = $state(0);\n<button onclick={() => value++}>Próximo</button>');
    assert.deepEqual(await audit(root), []);
  } finally { await rm(root, { recursive: true, force: true }); }
});
