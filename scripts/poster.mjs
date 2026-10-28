export function placeholderPoster(title) {
  const escape = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
  const label = title.replace(/^Exemplo fictício\s*[—-]\s*/i, '');
  const lines = [];
  let line = '';
  for (const word of label.split(/\s+/)) {
    if (line && (line + ' ' + word).length > 16) { lines.push(line); line = word; }
    else line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  const text = lines.slice(0, 5).map((value, index) => `<text x="70" y="${390 + index * 115}" font-size="${Math.min(108, 1370 / value.length)}" font-weight="900">${escape(value.toUpperCase())}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1250" viewBox="0 0 1000 1250"><rect width="1000" height="1250" fill="#F3EEE4"/><path d="M60 100H940M60 1140H940" stroke="#252035" stroke-width="4"/><g fill="#252035" font-family="sans-serif"><text x="70" y="80" font-size="28" letter-spacing="7">SEMNOME / PALMAS, TO</text><text x="70" y="160" font-size="24" letter-spacing="4">${title.startsWith('Exemplo fictício') ? 'EXEMPLO FICTÍCIO / NÃO É UM EVENTO REAL' : 'CARTAZ PROVISÓRIO'}</text>${text}<text x="70" y="1190" font-size="26">SUBSTITUA POR UMA IMAGEM AUTORIZADA.</text></g><g transform="rotate(-3 500 940)"><path fill="#FF633E" d="M0 850h1000v160H0z"/><text x="60" y="955" fill="#252035" font-family="sans-serif" font-weight="900" font-size="86">FOTO PENDENTE</text></g></svg>\n`;
}
