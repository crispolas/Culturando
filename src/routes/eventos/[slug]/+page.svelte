<script lang="ts">
  import { onMount } from 'svelte';
  import Arrow from '$lib/nav/Arrow.svelte';
  import { base } from '$app/paths';
  import { displayDate, isCurrent } from '$lib/content/dates';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  let now = $state<Date | null>(null);
  const past = $derived(now !== null && !isCurrent(data.event, now));
  onMount(() => {
    const refresh = () => { now = new Date(); };
    refresh();
    const timer = setInterval(refresh, 30_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  });
</script>

<svelte:head>
  <title>{data.event.title} — SEMNOME</title>
  <meta name="description" content={data.event.summary} />
  <link rel="canonical" href={data.canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="SEMNOME" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:title" content={data.event.title} />
  <meta property="og:description" content={data.event.summary} />
  <meta property="og:url" content={data.canonical} />
  <meta property="og:image" content={data.image} />
  <meta property="og:image:width" content={String(data.event.posterWidth)} />
  <meta property="og:image:height" content={String(data.event.posterHeight)} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content={`Cartaz de ${data.event.title}`} />
</svelte:head>
<main id="conteudo" class="detail">
  <nav aria-label="Retorno"><a href={`${base}/#${data.event.slug}`}><Arrow direction="left" /> Voltar à agenda</a><a class="brand" href={`${base}/`}>SEMNOME</a></nav>
  <article>
    <header><div class="section-meta"><span>Palmas, Tocantins / {data.event.category}</span><span>SEMNOME / Programação cultural</span></div><h1>{data.event.title.replace(/^Exemplo fictício\s*[—-]\s*/, '')}</h1></header>
    <div class="event-grid">
      <div class="detail-poster"><img class:duotone={data.event.posterIsPhoto} src={`${base}/cartazes/${data.event.slug}.jpg`} alt={`Cartaz de ${data.event.title}`} width={data.event.posterWidth} height={data.event.posterHeight} /></div>
      <div class="body-copy">
        {#if data.event.example}<p class="notice">Exemplo fictício — não é um evento real.</p>{/if}
        {#if past}<p class="notice" role="status">Este evento já terminou e saiu da programação.</p>{/if}
        <dl><div><dt>Quando</dt><dd class="numerals"><time datetime={data.event.date}>{displayDate(data.event.date)}</time>{#if data.event.endDate} até <time datetime={data.event.endDate}>{displayDate(data.event.endDate)}</time>{/if}<br />{data.event.time} · Horário de Palmas</dd></div><div><dt>Onde</dt><dd>{#if data.venue}{data.venue.nome}<br /><span>{data.venue.endereço}</span>{:else}Online ou sem local fixo.<br /><span>Confira a descrição.</span>{/if}</dd></div></dl>
        <div class="description">{@html data.event.html}</div>
        {#if data.event.link && !past}<a class="external" href={data.event.link} rel="noopener noreferrer">Informações com a organização <Arrow direction="up-right" /></a>{/if}
        <a class="back" href={`${base}/#eventos`}>Mais encontros na agenda <Arrow /></a>
      </div>
    </div>
  </article>
  <footer>Seu mapa cultural. / Palmas, Tocantins.</footer>
</main>
<style>
  .detail { padding: 2rem var(--gutter) 0; }
  nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 4rem; }
  nav a:first-child { display: flex; align-items: center; gap: .7rem; font-size: .8rem; }
  .brand { font-family: var(--display); font-weight: 900; letter-spacing: -.06em; font-size: 1.6rem; text-decoration: none; }
  h1 { font-size: clamp(3.5rem, 9vw, 9rem); max-width: 13ch; margin: 2rem 0 3rem; overflow-wrap: anywhere; font-stretch: 85%; }
  .event-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 7vw; align-items: start; }
  .detail-poster { padding: 1.5rem; background: var(--mint); }
  .detail-poster img { width: 100%; height: auto; box-shadow: 5px 6px 0 #25203540; }
  .body-copy { padding-bottom: 3rem; max-width: 35rem; }
  .notice { background: var(--sun); border: var(--line); padding: .75rem; font-size: .75rem; margin-bottom: 1rem; }
  dl { margin: 0 0 2rem; }
  dl > div { border-bottom: var(--line); padding: 1rem 0; }
  dt { font-size: .65rem; text-transform: uppercase; letter-spacing: .1em; margin-bottom: .5rem; }
  dd { margin: 0; font-weight: 650; line-height: 1.5; }
  dd span { font-size: .8rem; font-weight: 400; }
  .description { font-size: 1rem; line-height: 1.6; overflow-wrap: anywhere; }
  .description :global(p) { margin-bottom: 1rem; }
  .description :global(h2), .description :global(h3) { font-size: 1.8rem; margin: 1.5rem 0 1rem; }
  .description :global(img) { height: auto; }
  .external { display: flex; align-items: center; justify-content: space-between; gap: .8rem; background: var(--coral); padding: 1rem; margin-top: 2rem; font-size: .85rem; font-weight: 700; }
  .back { display: flex; gap: 1rem; align-items: center; font-size: .8rem; margin-top: 2rem; }
  footer { margin-top: 3rem; padding: 1.5rem 0; font-size: .7rem; border-top: var(--line); }
  @media (max-width: 700px) { .detail { padding-top: 1.2rem; } nav { margin-bottom: 2.5rem; } .brand { font-size: 1.3rem; } nav a:first-child { font-size: .65rem; } .section-meta { font-size: .5rem; } .section-meta span:last-child { display: none; } h1 { font-size: clamp(3rem, 14vw, 5rem); margin-bottom: 2rem; } .event-grid { grid-template-columns: 1fr; gap: 2rem; } }
</style>
