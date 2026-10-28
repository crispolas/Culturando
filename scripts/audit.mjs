import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const rules = [
  ['diretiva de evento antiga', /\bon:[\w-]+\s*=/g],
  ['export let', /\bexport\s+let\b/g],
  ['reatividade antiga', /\$\s*:/g],
  ['createEventDispatcher', /\bcreateEventDispatcher\b/g],
  ['slot antigo', /<slot\b/gi],
  ['vidro fosco', /backdrop-filter/gi],
  ['texto recortado no fundo', /background-clip\s*:\s*text/gi],
  ['gradiente', /(?:linear|radial|conic)-gradient/gi],
  ['fonte proibida', /\b(?:Inter|Roboto|Arial|Geist|Space\s+Grotesk|Poppins|system-ui)\b/gi],
  ['emoji', /\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]\uFE0F?\u20E3/gu],
  ['verbo proibido', /(?<![\p{L}\p{N}_])(?:Descubra|Explore|Eleve|Transforme)(?![\p{L}\p{N}_])/giu],
  ['pendência no código', /\b(?:TODO|FIXME)\b/g],
  ['tipo sem restrição', /\bany\b/g]
];

export async function audit(root = 'src') {
  const failures = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) { await visit(file); continue; }
      const buffer = await readFile(file);
      if (buffer.includes(0)) continue;
      const source = buffer.toString('utf8');
      for (const [label, pattern] of rules) {
        for (const match of source.matchAll(pattern)) {
          const line = source.slice(0, match.index).split('\n').length;
          failures.push(`${file}:${line}: ${label}: ${match[0]}`);
        }
      }
    }
  }
  await visit(root);
  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const failures = await audit();
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
  else console.log('Auditoria aprovada: nenhuma ocorrência proibida em src/.');
}
