import { readContent } from '../src/lib/content/read.mjs';
try {
  const { events, venues } = await readContent();
  console.log(`Conteúdo válido: ${events.length} eventos e ${venues.length} locais.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
