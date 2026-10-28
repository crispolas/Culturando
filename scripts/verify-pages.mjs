import { setTimeout } from 'node:timers/promises';

const url = new URL(process.env.PAGES_URL);
for (let attempt = 1; attempt <= 12; attempt++) {
  try {
    const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10_000) });
    const html = await response.text();
    if (response.ok && /name="application-name"\s+content="SEMNOME"/.test(html) && html.includes('/_app/immutable/')) {
      console.log(`SEMNOME confirmado no endereço público: ${url}`);
      break;
    }
    throw new Error(`HTTP ${response.status}: o conteúdo recebido ainda não é o aplicativo SEMNOME`);
  } catch (error) {
    if (attempt === 12) throw error;
    console.log(`Tentativa ${attempt}: ${error.message}. Aguardando a atualização do Pages.`);
    await setTimeout(5_000);
  }
}
