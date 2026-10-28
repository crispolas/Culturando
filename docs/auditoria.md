# Culturando — auditoria das fases 2 a 5

Verificação em 28/10/2026. As capturas e os logs abaixo registram a identidade anterior, SEMNOME; o projeto foi posteriormente renomeado para Culturando. Implementação local, sem push ou deploy. A validação da geografia real do mapa está pendente de acesso de rede; os testes com tiles simulados não substituem essa verificação.

## Fase 2 — sistema visual e hero

- Tokens de cor, Archivo Variable, Atkinson Hyperlegible Next, grão SVG e filtro duotone compartilhado.
- Wordmark largo em máscara SVG, seis recortes em três profundidades, faixa coral e navegação em ilha.
- Hero pausa fora da tela; movimento reduzido tem composição estática e celular tem deriva discreta.
- Dependência `@fontsource-variable/archivo`: eixos de peso/largura para display auto-hospedada.
- Dependência `@fontsource-variable/atkinson-hyperlegible-next`: texto legível e auto-hospedado.
- `npm run check`, `npm run audit`, `npm run build` e Chromium nas duas dimensões passaram na versão consolidada.
- Desvio necessário: os recortes e janelas usam cartazes “FOTO PENDENTE”; não foram inventadas fotos ou permissões.

## Fase 3 — carrossel e páginas

- Um cartaz por vez, sem distorção, com informação editorial, categoria depois do título e link à página do evento.
- Botões, setas, Home/End, gesto horizontal e anúncio `aria-live`; sem avanço automático.
- A seleção usa `#slug`; páginas individuais preservam Open Graph e imagens JPEG com dimensões reais.
- Chromium confirmou botões, teclado, recarga da URL, gestos horizontais e preservação da rolagem vertical.
- Eventos vencidos saem sem rebuild; ausência de eventos e ausência de JavaScript têm mensagens próprias.
- Os comandos de verificação consolidados passaram; nenhuma dependência adicional nesta fase.

## Fase 4 — mapa e filtros

- MapLibre com ruas por hierarquia, água menta, papel, sem edifícios, atribuição vinculada e limites de navegação.
- Dependência `maplibre-gl`: renderização vetorial, navegação, popup e agrupamento de eventos.
- Filtros atualizam carrossel e pontos; eventos sem local não geram marcador. `content/venues.json` continua vazio.
- Testes com MapLibre real em cópia isolada: cluster de três, expansão progressiva, popup, seleção bidirecional e remoção por filtro passaram.
- O mesmo teste do mapa passou com `BASE_PATH=/Culturando`, incluindo o worker servido sob o subdiretório de GitHub Pages.
- A cópia de teste contém locais explicitamente fictícios e tiles vazios interceptados; esses dados não foram incluídos no projeto publicado.
- Rede indisponível, nova tentativa e carrossel independente foram exercitados no navegador.
- Limitação: `tiles.openfreemap.org` recebeu HTTP 403; a adição desse domínio foi salva no rascunho de rede, ainda sem aplicação/publicação comprovada.

## Fase 5 — acabamento e evidências

- `npm run check`: zero erros e zero avisos. `npm run audit`: nenhuma ocorrência proibida em `src/`.
- `npm test`: nove testes passaram, incluindo calendário, locais, auditoria, GeoJSON e contraste de todas as categorias.
- `npm run build`: saída estática gerada. O Vite avisa sobre o tamanho do chunk do MapLibre; o aviso permanece visível e o chunk é adiado.
- Chromium em 1440×900 e 390×844: navegação, foco, filtros, modal ampliado/Escape, imagens e páginas individuais passaram, sem overflow horizontal.
- Axe WCAG 2 A/AA e 2.1 AA: zero ocorrências nos quatro cenários (inicial e evento, desktop e celular). Isso não substitui avaliação humana com leitores de tela.
- Movimento reduzido, pausa do hero fora da tela e expiração com relógio avançado foram verificados.
- Limitações: não houve teste em celular físico, Safari, Firefox, rede móvel real, leitor de tela humano ou publicação remota.

## Auditoria de layouts — DESIGN.md

| Regra | Evidência na implementação |
| --- | --- |
| Sem três cards iguais em linha | A agenda apresenta um evento por vez; o hero usa a colagem de seis recortes definida no design. |
| Sem etiqueta-pílula acima do título | Categorias aparecem depois do título, como etiquetas retangulares. |
| Sem hero centralizado genérico | Wordmark largo, recortes desalinhados e faixa inclinada; composição assimétrica. |
| Sem cards dentro de cards | Informações ficam em coluna aberta; popup e painel do mapa têm função específica de navegação. |
| Sem vidro fosco | Navegação sólida; auditoria rejeita `backdrop-filter`. |
| Sem tema escuro permanente | Papel como base; amarelo na seção sobre e tinta em ações/navegação. |
| Sem formas geométricas aleatórias | As formas correspondem a cartazes, marcadores, máscara de letras, controles ou à faixa editorial. |
| Sem gradientes e fontes proibidas | Auditoria textual aprovada. Fontes locais licenciadas. |
| Roxo limitado às etiquetas | A seleção de teatro mantém a superfície do cartaz em papel; roxo é usado na categoria e em seu marcador/filtro. |

## Auditoria de código — AGENTS.md

- Svelte 5 com runes, TypeScript estrito, CSS próprio, sem Tailwind, biblioteca de componentes ou backend.
- Conteúdo, hero, eventos, mapa e navegação separados por funcionalidade; sem `utils.ts`, services, managers ou factories.
- Categorias/cores centralizadas em `src/lib/events/categories.ts`; a validação deriva a lista desse arquivo.
- Sem stores, sintaxe antiga, código morto ou pendências nas fontes. O audit testa suas próprias regras com entradas proibidas.
- Erros não são engolidos: conteúdo inválido interrompe o build; falhas do mapa produzem estado visível e nova tentativa.
- A regra sobre destinos de âncoras no HTML pré-renderizado foi acrescentada após falhas reais de build; os destinos foram corrigidos, sem desativar a verificação.
- Dependências novas e respectivas justificativas estão no README. Não foram acrescentadas funcionalidades de login, ingressos, comentários ou cadastro público.

Saída final de `npm run audit`:

```text
> semnome@0.1.0 audit
> node scripts/audit.mjs

Auditoria aprovada: nenhuma ocorrência proibida em src/.
```

## Peso e desempenho

Medição local no Chromium, viewport 1440×900, cache frio, sem simulação de rede lenta e com movimento reduzido: aproximadamente **549 kB transferidos em recursos iniciais**, incluindo fontes e seis cartazes. CLS observado: **0**. LCP local observado: cerca de **272 ms**; não representa desempenho de produção ou de dispositivos móveis reais. [Dados da sessão](evidence/performance.json).

A biblioteca do MapLibre (~1,10 MB minificada; ~301 kB gzip) e o worker (~517 kB sem compressão) não são pedidos no carregamento inicial. Só são solicitados quando a seção do mapa se aproxima da tela. O CSS do mapa também é adiado. O worker é servido pelo próprio site, com URL gerada pelo Vite, sem CDN. O aviso de tamanho do Vite é conhecido; dividir artificialmente o arquivo não diminuiria o código necessário para renderizar o mapa.

As fontes latinas somam aproximadamente 124 kB. Cartazes são convertidos para JPEG, limitados a 1000 px, e reutilizados pelo hero, carrossel, detalhe e Open Graph. Dimensões reais são incluídas no HTML para reservar espaço; o carrossel contém proporções variadas sem distorção.

## Capturas e resultados

- [Hero em 1440×900](evidence/hero-1440.png).
- [Página completa — desktop](evidence/desktop-1440.png).
- [Página completa — celular](evidence/mobile-390.png).
- [Página de evento — celular](evidence/evento-390.png).
- [Resultados Axe](evidence/axe.json).
- [Saída dos nove testes](evidence/tests.txt).
- [Saída do build estático](evidence/build.txt).
- [Saída da auditoria textual](evidence/audit.txt).

As capturas do mapa exibem o estado de indisponibilidade. Não são prova de cobertura cartográfica de Palmas.

Ferramentas de sessão: Chromium instalado e Playwright/Axe em `/tmp/semnome-browser`, fora das dependências do projeto. Executados `node /tmp/semnome-browser/final.mjs`, `touch.mjs`, `performance.mjs` e `map-fixture.mjs`; o último usa uma cópia temporária e respostas de rede simuladas. Os nove testes portáveis do repositório continuam disponíveis via `npm test`.

## Fontes e pendências externas

- [OpenFreeMap: serviço público sem chave e sem limite declarado de requisições](https://github.com/hyperknot/openfreemap).
- [Dados e atribuição OpenStreetMap](https://www.openstreetmap.org/copyright).
- [Referência pública de municípios](https://github.com/kelvins/municipios-brasileiros): Palmas, código 1721000, referência municipal -10.24/-48.3558, dentro dos limites definidos. O centro urbano aproximado -10.18/-48.33 do DESIGN foi mantido. Isso não verifica os tiles.
- Licenças das fontes e do MapLibre acompanham a saída em `static/licenses/`.

Para verificar o mapa real no ambiente, revise e salve `tiles.openfreemap.org` nas configurações de rede e publique o ambiente. A gravação do rascunho não aplicou nem publicou essa configuração. Depois, reabra o mapa e confirme ruas, água e atribuição com os tiles reais. Não é necessária chave de API.

Para lançar o site: remova os seis exemplos listados no README, forneça conteúdo e imagens autorizados, habilite GitHub Pages/Actions e publique as alterações pelo fluxo do repositório. Nenhum push, merge ou deploy foi realizado nesta tarefa.

## Renomeação para Culturando

Nome atualizado no hero, navegação, rodapé, favicon, cartazes, conteúdo, títulos, Open Graph, documentação e verificação de publicação. O pacote npm também passa a se chamar `culturando`. As capturas e logs anteriores foram preservados como registro histórico.

`npm run check`, `npm run audit`, `npm test` (9 aprovados) e `npm run build` passaram. O Chromium verificou a identidade, metadados, páginas de evento e ausência de overflow em 1440×900 e 390×844. Capturas atualizadas: [desktop](evidence/culturando-1440.png) e [celular](evidence/culturando-390.png).

## Revisão fotográfica

A pedido do usuário, os seis cartazes tipográficos de demonstração foram substituídos por fotografias reais de fonte verificável e licença CC0 declarada pela distribuição. Elas são identificadas como ilustrativas; não há afirmação de que mostrem os eventos fictícios ou locais de Palmas. [Fontes e licenças](image-sources.md).

As fotos aparecem em cores naturais, sem molduras de cartaz no carrossel. A agenda usa janela 3:4 com posição ajustável por evento; a página individual preserva a imagem inteira. Descrição alternativa, crédito e origem são campos opcionais no frontmatter. A revisão da imagem integra sua URL para atualizar o cache também nos compartilhamentos. O duotone fica nas letras do hero; a colagem usa fotografias naturais e inclinações menores. Alguns slogans foram substituídos por informações diretas.

Verificações: `npm run check` (zero erros/avisos), `npm run audit`, `npm test` (9 aprovados) e `npm run build` passaram. Playwright/Chromium em 1440×900 e 390×844 percorreu as seis fotos e confirmou proporção 3:4, ausência de filtro na fotografia, créditos, texto alternativo, URL com revisão e proporção original no detalhe. Axe WCAG A/AA e 2.1 AA não apontou ocorrências nas páginas iniciais verificadas.

Capturas: [desktop](evidence/fotos-1440.png), [celular](evidence/fotos-390.png). [Resultado Axe](evidence/fotos-axe.json). Google e Wikimedia estavam bloqueados pela política de rede; os arquivos vieram dos repositórios oficiais indicados na documentação de fontes, sem incorporar o layout ou o código dos temas de origem.

## Revisão de destaque contínuo — 28/10/2026

Solicitação: retirar slogans, faixas divisórias e títulos enviados nas capturas, aproximar o conteúdo e substituir o slide único por fotos em loop. O topo mantém somente Culturando; DESTAQUE abre fotos 3:4 em movimento, com pausa no hover/foco, controles de direção e pausa manual. Selecionar leva a foto para a lateral dos detalhes via View Transitions quando disponível; clicar fora ou fechar devolve a imagem. Escape restaura o foco. Nenhuma dependência adicionada.

PROGRAMAÇÃO GERAL alterna para uma lista de todos os eventos publicados, inclusive os encerrados identificados. Não há novo campo ou processo de cadastro. O destaque continua ocultando os passados no fuso de Palmas.

`npm run check`: 0 erros e 0 avisos. `npm run audit`: aprovado. `npm test`: 9 testes aprovados. `npm run build`: site estático gerado, com o aviso já conhecido do tamanho do MapLibre carregado sob demanda.

Chromium em 1440×900 e 390×844: movimento automático, pausa no hover, duas direções, pausa manual, abertura de detalhes, clique externo com retomada, lista dos seis eventos, Escape/foco e movimento reduzido aprovados. Axe WCAG A/AA: zero ocorrências nas telas principal e de detalhe. Sem rolagem horizontal. Evidências: `docs/evidence/destaque-*.png` e `destaque-verificacao.json`. Tiles bloqueados neste ambiente, portanto a geografia real do mapa não foi revalidada; captura mostra a contingência de carregamento. Publicação verificada separadamente pelo workflow do Pages.

Verificação complementar no Chromium móvel com toque: URL direta `#exemplo-ficticio-som-de-rascunho`, abrir/fechar por toque, arrastar sem abrir acidentalmente, selecionar uma foto na repetição do loop e alternativa sem View Transitions aprovados. A abertura por hash evita repetir a navegação durante a inicialização do SvelteKit.
