import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { access, mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { stringify } from 'yaml';
import { eventSchema, venueSchema, formatIssues, categoryNames } from '../src/lib/content/schema.mjs';
import { readContent } from '../src/lib/content/read.mjs';
import { placeholderPoster } from './poster.mjs';

const terminal = createInterface({ input: stdin, output: stdout });
async function ask(label, schema) {
  while (true) {
    const value = (await terminal.question(`${label}: `)).trim();
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    console.log(formatIssues('novo-evento', result.error.issues).join('\n'));
  }
}

let folder;
let completed = false;
try {
  const { venues } = await readContent();
  const title = await ask('Título', eventSchema.shape.title);
  console.log(categoryNames.map((category, index) => `${index + 1}. ${category}`).join('\n'));
  let category;
  while (!category) {
    const answer = (await terminal.question('Categoria (nome ou número): ')).trim();
    const selected = categoryNames[Number(answer) - 1] || answer;
    if (categoryNames.includes(selected)) category = selected;
    else console.log('Escolha uma categoria da lista.');
  }
  const date = await ask('Data (AAAA-MM-DD)', eventSchema.shape.date);
  const time = await ask('Hora (HH:MM, horário de Palmas)', eventSchema.shape.time);
  console.log('0. Online ou sem local fixo\n' + venues.map((venue, index) => `${index + 1}. ${venue.nome}`).join('\n') + '\nN. Cadastrar novo local');
  let venue = '';
  let newVenue;
  while (true) {
    const choice = (await terminal.question('Local (número ou N): ')).trim().toLowerCase();
    if (choice === '0') break;
    if (/^\d+$/.test(choice) && venues[Number(choice) - 1]) { venue = venues[Number(choice) - 1].slug; break; }
    if (choice !== 'n') { console.log('Escolha um local da lista, 0 ou N.'); continue; }
    const nome = await ask('Nome do local', venueSchema.shape.nome);
    let slug;
    while (!slug) {
      const answer = await ask('Identificador do local (ex.: espaco-cultural)', venueSchema.shape.slug);
      if (venues.some((item) => item.slug === answer)) console.log('Esse identificador já existe.');
      else slug = answer;
    }
    const endereço = await ask('Endereço', venueSchema.shape.endereço);
    async function coordinate(label, schema) {
      while (true) {
        const answer = (await terminal.question(`${label}: `)).trim();
        const value = Number(answer.replace(',', '.'));
        if (answer && schema.safeParse(value).success) return value;
        console.log('Informe uma coordenada válida em graus decimais.');
      }
    }
    const lat = await coordinate('Latitude (ex.: -10.18)', venueSchema.shape.lat);
    const lng = await coordinate('Longitude (ex.: -48.33)', venueSchema.shape.lng);
    newVenue = { slug, nome, endereço, lat, lng };
    venue = slug;
    break;
  }
  let endDate;
  while (true) {
    const answer = (await terminal.question('Data final (AAAA-MM-DD; Enter para evento de um dia): ')).trim();
    if (!answer) break;
    if (eventSchema.shape.endDate.safeParse(answer).success && answer >= date) { endDate = answer; break; }
    console.log('Informe uma data válida igual ou posterior à inicial.');
  }
  let link;
  while (true) {
    const answer = (await terminal.question('Link da organização (opcional): ')).trim();
    if (!answer) break;
    if (eventSchema.shape.link.safeParse(answer).success) { link = answer; break; }
    console.log('Informe uma URL completa com http ou https.');
  }
  const description = await ask('Descrição (pode ampliar depois no arquivo)', eventSchema.shape.description);
  const metadata = { title, category, date, time, ...(endDate ? { endDate } : {}), venue, ...(link ? { link } : {}) };
  eventSchema.parse({ ...metadata, description });
  const stem = title.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'evento';
  let slug = stem;
  let suffix = 2;
  while (true) {
    try { await access(`content/events/${slug}`); slug = `${stem}-${suffix++}`; }
    catch (error) { if (error.code === 'ENOENT') break; throw error; }
  }
  folder = `content/events/${slug}`;
  await mkdir(folder);
  await writeFile(`${folder}/index.md`, `---\n${stringify(metadata)}---\n\n${description}\n`, { flag: 'wx' });
  await writeFile(`${folder}/cartaz.svg`, placeholderPoster(title), { flag: 'wx' });
  if (newVenue) {
    const temporary = `content/venues.${process.pid}.json`;
    try {
      await writeFile(temporary, JSON.stringify([...venues, newVenue], null, 2) + '\n', { flag: 'wx' });
      await rename(temporary, 'content/venues.json');
    } finally { await rm(temporary, { force: true }); }
  }
  completed = true;
  console.log(`\nCriado: ${folder}/index.md\nSubstitua cartaz.svg por um único cartaz.jpg, .png, .webp ou .svg autorizado.\nRevise o conteúdo e execute npm run check && npm run audit && npm run build.`);
} catch (error) {
  console.error(`Não foi possível criar o evento: ${error.message}`);
  process.exitCode = 1;
} finally {
  terminal.close();
  if (folder && !completed) await rm(folder, { recursive: true, force: true });
}
