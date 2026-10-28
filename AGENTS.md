# AGENTS.md — SEMNOME

Site de agenda cultural de Palmas (TO). Leia DESIGN.md antes de qualquer trabalho visual e docs/brief.md para o contexto do projeto.

## Stack (fixa)
SvelteKit 2 + Svelte 5 (somente runes) + TypeScript estrito, adapter-static, CSS próprio com custom properties, MapLibre GL JS, Zod para validar eventos. Gerenciador: npm. Identificadores em inglês; textos da interface e conteúdo em português do Brasil.
Sem Tailwind, sem biblioteca de componentes, sem backend.

## Comandos
npm run dev | check | build | audit | novo-evento
Antes de concluir qualquer tarefa: `npm run check && npm run audit && npm run build`.

## Svelte 5
Faça: $state, $derived, $effect, $props, {#snippet}/{@render}, atributos onclick/oninput.
Consulte https://svelte.dev/docs/llms antes de escrever componentes.
Não use: export let, $:, on:click, createEventDispatcher, <slot>, stores quando $state resolver.

## Organização
- Pastas por funcionalidade: src/lib/{hero,events,map,nav}/. Conteúdo em content/.
- Escreva a solução direta. Extraia função ou componente apenas na segunda repetição real.
- Um arquivo, uma responsabilidade. Sem utils.ts genérico.
- Comentário apenas para o "porquê" que o código não mostra.
- Cada dependência nova exige uma linha de justificativa no resumo; prefira CSS, View Transitions e svelte/motion.
- Não crie: services/managers/factories para uso único; opções de configuração para o que não varia; verificações para condições impossíveis; try/catch que engole erro; código morto, TODO, FIXME, "legado".

## Verificação e relato
Se não for possível abrir o site em navegador (1440×900 e 390×844), diga explicitamente que não houve verificação visual. Nunca declare "testado" sem o comando e o resultado.
Ao errar duas vezes no mesmo ponto, proponha uma regra para este arquivo.

## Âncoras e pré-renderização
Toda âncora interna deve ter um destino presente no HTML pré-renderizado de cada rota que a contém, inclusive o link de pular navegação. Verifique todas as rotas antes de iniciar o preview.
