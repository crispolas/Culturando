# SEMNOME

Agenda cultural de Palmas (TO). Conteúdo em Markdown e JSON, sem banco de dados, login ou painel obrigatório. SvelteKit 2, Svelte 5 com runes, TypeScript estrito e geração estática. A interface usa a direção “parede de cartazes”: tipografia variável, papel com grão, duotone, carrossel e mapa sincronizados. Sem fotos autorizadas, os seis exemplos usam cartazes “FOTO PENDENTE”.

## Como publicar um evento
1. No GitHub, abra `content/events/` e use **Add file → Create new file** com o caminho `<slug>/index.md`, ou abra um evento e clique no lápis para editar.
2. Copie o modelo abaixo; preencha título, categoria, data, hora e descrição. Use um slug único, como `nome-do-evento`.
3. Em `venue`, use um slug de `content/venues.json`; para online/sem local fixo, use `""` e explique na descrição.
4. Cadastre locais novos uma única vez em `content/venues.json`, com endereço e coordenadas conferidos pela organização.
5. Na pasta do evento, use **Add file → Upload files** e envie um único `cartaz.jpg`, `.jpeg`, `.png`, `.webp` ou `.svg`, com autorização de uso.
6. Faça **Commit changes** dos arquivos na `main`; o GitHub Actions valida e faz deploy automático após a configuração inicial de Pages.
7. Se a validação falhar, veja o arquivo/campo em **Actions**, corrija e faça outro commit; a versão anterior permanece publicada.

```yaml
---
title: "Título informado pela organização"
category: "música"
date: "2027-08-15"
time: "19:30"
venue: ""
# endDate: "2027-08-16"
# link: "https://endereco-da-organizacao.example"
---

Descrição em Markdown. Informe aqui se a atividade é online ou itinerante.
```

Categorias: `dança`, `música`, `teatro`, `exposição`, `festival`, `oficina`, `outros`. Datas precisam existir no calendário; hora em `HH:MM`, no fuso `America/Araguaina`. `endDate` e `link` são opcionais: omita-os se não houver valor. `description` é o corpo Markdown, não um campo no YAML. HTML embutido é desativado. O cartaz é identificado pelo nome, sem cadastro extra no frontmatter.

`content/venues.json` é uma lista; cada local tem `slug`, `nome`, `endereço`, `lat` e `lng`. Coordenadas são números decimais (latitude entre -90 e 90, longitude entre -180 e 180). Não há locais reais pré-cadastrados: confirme endereço e coordenadas antes de cadastrar. Eventos com `venue` vazio, nulo ou omitido não têm marcador. O formato de pastas/frontmatter é compatível com configuração futura de CMS baseado em Git.

## Cadastro pelo terminal

```sh
npm ci
npm run novo-evento
```

O assistente pergunta os dados, permite reutilizar ou cadastrar um local e cria a pasta com Markdown e cartaz provisório. Não sobrescreve eventos existentes: títulos repetidos recebem sufixos. Edite o texto e substitua o cartaz provisório antes de publicar. Para locais novos, confirme os dados com a organização; não estime coordenadas. O cartaz provisório traz “FOTO PENDENTE”.

## Desenvolvimento e verificações

Node.js 24 é usado localmente e no CI (inclui execução nativa de TypeScript nos testes e scripts). Use o checkout existente; cada tarefa na nuvem já é isolada.

```sh
npm ci
npm run dev
npm run check && npm run audit && npm run build
npm test
npm run preview
```

Ao editar arquivos em `content/` ou rodar o assistente, reinicie `npm run dev` para reler o catálogo.

`npm run validate` valida só conteúdo; `prebuild` executa essa validação automaticamente. Erros indicam arquivo e campo em português e interrompem o build. Cada evento gera `/eventos/<slug>/` e um JPEG otimizado em `/cartazes/<slug>.jpg`; a página inclui Open Graph com URL e imagem absolutas. O build preserva todas as páginas para links compartilhados continuarem acessíveis. A agenda filtra eventos passados no navegador ao carregar, a cada 30 segundos e quando a aba volta a ficar visível. Sem hora de encerramento no modelo, um evento fica na agenda até 23:59:59 da sua data final (ou inicial), em Palmas. A página individual continua acessível com aviso de encerramento; sem JavaScript, o arquivo permanece acessível, mas a agenda pede sua ativação.

A auditoria varre `src/` e rejeita sintaxe antiga de Svelte, estilos/fontes/textos proibidos, emojis, pendências e tipos irrestritos. Ela é textual e deliberadamente estrita, inclusive em comentários. `npm test` exercita validação, referências a locais, calendário, virada de dia em Palmas e regras da auditoria.

## Publicação inicial

No repositório GitHub, em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. O workflow `.github/workflows/pages.yml` verifica pull requests e publica commits na `main`, depois das verificações. Domínio e caminho são obtidos de `actions/configure-pages`; o build gera Open Graph para esse destino. A primeira publicação depende de habilitar Pages e permitir as Actions no repositório. Nenhum deploy é feito pelo cadastro local.

Em outra hospedagem estática, use `npm ci && npm run check && npm run audit && npm run build` e publique `build/`. Defina `PUBLIC_SITE_URL` como a origem pública (por exemplo, `https://seu-dominio.example`), e `BASE_PATH` como o subdiretório, se existir. Não inclua o subdiretório em ambas as variáveis. `.env.example` documenta as opções locais; sem configuração, o build usa origem local apenas para desenvolvimento. Para testar outro destino, passe as variáveis ao comando de build; mantenha o mesmo `BASE_PATH` ao executar `npm run preview`. Reinicie o preview após reconstruir a saída, pois os nomes dos arquivos compilados mudam. Não há segredo obrigatório nesta fase.

## Exemplos — remover antes do lançamento

Todos usam `example: true`, datas demonstrativas em 2099 e cartazes tipográficos próprios; nenhum anuncia uma atividade real. Apague estas seis pastas inteiras antes do lançamento:

- `content/events/exemplo-ficticio-danca-de-papel/` — Exemplo fictício — Dança de Papel.
- `content/events/exemplo-ficticio-som-de-rascunho/` — Exemplo fictício — Som de Rascunho.
- `content/events/exemplo-ficticio-palco-imaginario/` — Exemplo fictício — Palco Imaginário.
- `content/events/exemplo-ficticio-galeria-inventada/` — Exemplo fictício — Galeria Inventada.
- `content/events/exemplo-ficticio-festival-de-teste/` — Exemplo fictício — Festival de Teste.
- `content/events/exemplo-ficticio-oficina-imaginaria/` — Exemplo fictício — Oficina Imaginária.

Mantenha `content/events/` no Git após remover todos os eventos (um `.gitkeep` resolve). Nenhuma foto, direito de imagem ou local real foi presumido.

## Dependências desta fase

- `svelte`: componentes reativos com runes, conforme a stack fixa.
- `@sveltejs/kit`: rotas, carregamento de conteúdo e pré-renderização.
- `@sveltejs/adapter-static`: saída estática sem servidor de aplicação.
- `vite`: servidor de desenvolvimento e build da stack SvelteKit.
- `@sveltejs/vite-plugin-svelte`: compilação dos componentes no Vite.
- `typescript`: verificação estrita e tipos gerados das rotas.
- `svelte-check`: diagnóstico de tipos e acessibilidade dos componentes.
- `@types/node`: tipos das APIs de arquivos e ambiente usadas no build.
- `zod`: validação compartilhada entre build e assistente.
- `yaml`: leitura e escrita do frontmatter sem converter datas em objetos automaticamente; substitui a combinação gray-matter/parser proposta no plano.
- `markdown-it`: renderização Markdown com HTML desativado e bloqueio de protocolos inseguros.
- `@types/markdown-it`: tipos do renderizador para TypeScript estrito.
- `sharp`: conversão dos cartazes em JPEG otimizado, também usado no Open Graph.

- `@fontsource-variable/archivo`: display auto-hospedada com eixos de peso e largura para títulos e wordmark.
- `@fontsource-variable/atkinson-hyperlegible-next`: leitura auto-hospedada, com numerais tabulares nas datas e horários.
- `maplibre-gl`: renderização vetorial, navegação e agrupamento de eventos no mapa. O worker é empacotado pelo Vite e servido localmente.

## Interface, mapa e evidências

A agenda aceita navegação por botões, setas do teclado e gesto horizontal; a seleção pode ser compartilhada por `/#<slug>` ou pela página `/eventos/<slug>/`. Filtros de categoria atualizam carrossel e mapa. Marcadores aparecem somente para eventos com local cadastrado. O mapa pode ser ampliado; Escape fecha e o foco permanece no painel enquanto ele está ampliado. Sem JavaScript, a programação atualizada pede sua ativação; as páginas individuais continuam legíveis.

O mapa usa tiles vetoriais OpenFreeMap (`https://tiles.openfreemap.org/planet`) com dados OpenStreetMap/OpenMapTiles, sem chave. O serviço público é gratuito conforme a [documentação oficial](https://github.com/hyperknot/openfreemap). A atribuição está visível e vinculada no mapa. Só esse domínio externo é solicitado para o mapa: não usamos geocodificação, rastreamento, fontes remotas ou imagens por hotlink. Em ambientes com rede restrita, permita `tiles.openfreemap.org`; se a rede ou WebGL falhar, a agenda continua operante e o mapa oferece nova tentativa.

O mapa, seu CSS e seu worker só são carregados quando a seção se aproxima da tela. O hero pausa fora da tela; movimentos respeitam `prefers-reduced-motion`. Não há fotos reais nem locais reais de demonstração: substitua os cartazes e remova os seis eventos antes de publicar. Os avisos de exemplo também aparecem na interface.

Licenças das fontes e do MapLibre são distribuídas em `static/licenses/`. Consulte [a auditoria final e suas capturas](docs/auditoria.md) para resultados, limitações e pendências de rede/publicação.
