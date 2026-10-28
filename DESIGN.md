# DESIGN.md — Culturando

## Direção (decidida; não reinterpretar)
Conceito: "parede de cartazes". O site é um muro de rua onde a cena cultural de Palmas está colada: cartazes sobrepostos, fotografias recortadas em duotone, tipografia enorme, papel com grão. O mapa é uma serigrafia da cidade.
Cada elemento visual vem de um evento real ou de uma categoria cultural. Nada é preenchimento.
Sensação: tátil, quente, contemporânea, de rua. Não: tecnologia, SaaS, corporativo, futurista.
Referências (yashf.in, 404s.design, godly.website): inspiram liberdade de composição, não layout. Não copiar.

## Cores (custom properties)
--ink #252035 | --paper #F3EEE4 (proposta; ajustável) | --coral #FF633E | --violet #8054E8 | --sun #F9D84A | --mint #67C9B2
- Fundo: paper ou ink. Nunca branco puro. Nunca roxo como fundo do hero.
- Coral: ação e destaque. Amarelo: realce tipo marca-texto. Menta: mapa e estado ativo. Roxo: máximo 10% da área visível, em etiquetas de categoria.
- Texto sobre coral, amarelo e menta é sempre ink. Texto branco só sobre ink ou roxo (branco sobre coral fica perto de 3:1, abaixo do mínimo; conferir os demais contrastes).
- PROIBIDO qualquer gradiente (linear, radial, cônico) e texto com gradiente. Profundidade vem de sobreposição, sombra dura deslocada (sem blur) e grão em SVG.
- Cores por categoria em um único arquivo typed (categories.ts): dança=coral, música=sun, teatro=violet, exposição=mint; demais categorias em ink com contorno colorido.

## Tipografia
Proibidas: Inter, Roboto, Arial, Geist, Space Grotesk, Poppins e system-ui visível. Não adotar a primeira fonte "elegante" que vier à mente: escolher de uma lista curta e justificar cada escolha em uma linha.
Ponto de partida (verificar disponibilidade): display = Archivo (eixo de largura, extremos condensado/expandido, peso 800–900); texto = Atkinson Hyperlegible Next ou Schibsted Grotesk; datas e horários com numerais tabulares.
Fontes auto-hospedadas (Fontsource), sem Google Fonts em tempo de execução. Tamanhos fluidos com clamp().

## Seções
**Hero.** Wordmark Culturando ocupando ao menos 80% da largura em desktop. As letras funcionam como janelas: fotografias duotone (paleta) alternam dentro delas via máscara SVG. 5–7 recortes fotográficos em três camadas de profundidade respondem ao cursor (translate3d, até 24 px, com suavização). "Seu mapa cultural" em ink sobre faixa coral inclinada até 2°. No celular, sem cursor: deriva lenta e discreta.
**Navbar em ilha.** Cápsula compacta, sólida (ink), sem blur nem vidro. Expande ao foco/hover com Eventos, Mapa e Sobre. Ponto coral indica a seção ativa. Operável por teclado.
**Carrossel.** Fotografia grande à esquerda, em janela 3:4 com enquadramento definido por evento; a página individual preserva a proporção inteira, informações à direita: título em display, data/horário em numerais tabulares, local, descrição curta, link. A cada evento, a transição troca o cartaz (clip-path), o texto e a cor de realce da seção. Setas, teclado, toque e URL própria por evento (#slug). Eventos passados saem em tempo de execução, usando o fuso America/Araguaina.
**Mapa.** MapLibre sobre dados OpenStreetMap; verificar uma fonte de tiles vetoriais gratuita, sem chave, e manter a atribuição obrigatória. Estilo construído em código: fundo paper, ruas em ink com espessura por hierarquia, água em mint, sem edifícios, rótulos mínimos. Centro aproximado -10.18, -48.33 (conferir), com limites de navegação. Marcadores por categoria, agrupamento quando houver densidade, popup em formato de cartaz. Selecionar um evento no carrossel move o mapa até ele e vice-versa. Filtros por categoria como etiquetas tipográficas. No celular: mapa em tela cheia com painel inferior.

## Imagens
A revisão solicitada pelo usuário permite fotografias reais obtidas na web. Usar arquivos locais com origem e licença verificáveis; imagens de demonstração devem estar identificadas como ilustrativas, sem sugerir registros de eventos reais de Palmas. Fotos ficam em content/events/<slug>/. Na agenda e nos recortes do hero, usar janela 3:4 com enquadramento ajustável; na página do evento, mostrar a imagem inteira. Preservar cores naturais; o duotone fica restrito às letras do wordmark. Imagens geradas por IA e hotlink continuam excluídos. Otimizar no build com sharp. O placeholder tipográfico do assistente serve apenas até a imagem ser enviada.

## Movimento
Cada animação precisa responder: o que ela comunica? Somente transform/opacity/clip-path. Sem scroll-jacking. Pausar o que sai da tela (IntersectionObserver). Respeitar prefers-reduced-motion com alternativa estática equivalente. Priorizar CSS, View Transitions e svelte/motion; GSAP só com justificativa e licença verificada.

## Texto da interface
pt-BR natural, curto, como uma pessoa de Palmas escreveria. Sem emojis, sem "Descubra", "Explore", "Eleve", "Transforme". Ícones: SVG próprios e mínimos, ou nenhum.

## Layouts proibidos
Três cards iguais em linha; etiqueta-pílula acima do título; hero centralizado genérico; cards dentro de cards; vidro fosco; tema escuro permanente por padrão; formas geométricas aleatórias de preenchimento.
