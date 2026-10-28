<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { displayDate } from '$lib/content/dates';
  import Arrow from '$lib/nav/Arrow.svelte';
  import { categories } from './categories';
  import type { Event, Venue } from './types';
  let { events, venues, selected, onselect }: { events: Event[]; venues: Venue[]; selected: Event | undefined; onselect: (slug: string) => void } = $props();
  const index = $derived(events.findIndex((event) => event.slug === selected?.slug));
  const venue = $derived(venues.find((place) => place.slug === selected?.venue));
  const accent = $derived(selected ? categories[selected.category as keyof typeof categories].color : 'var(--sun)');
  let region: HTMLDivElement;
  let startX = 0;
  let startY = 0;
  function step(direction: number) {
    if (events.length < 2) return;
    onselect(events[(index + direction + events.length) % events.length].slug);
  }
  function keys(event: KeyboardEvent) {
    if ((event.target as HTMLElement).closest('a')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'Home' && events.length) { event.preventDefault(); onselect(events[0].slug); }
    if (event.key === 'End' && events.length) { event.preventDefault(); onselect(events[events.length - 1].slug); }
  }
  onMount(() => {
    const start = (event: TouchEvent) => { startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY; };
    const end = (event: TouchEvent) => { const dx = event.changedTouches[0].clientX - startX; const dy = event.changedTouches[0].clientY - startY; if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1); };
    region.addEventListener('keydown', keys);
    region.addEventListener('touchstart', start, { passive: true });
    region.addEventListener('touchend', end, { passive: true });
    return () => { region.removeEventListener('keydown', keys); region.removeEventListener('touchstart', start); region.removeEventListener('touchend', end); };
  });
</script>
<section class="events" aria-labelledby="events-heading" style={`--poster-surface:${selected?.category === 'teatro' ? 'var(--paper)' : accent};--accent:${accent};--accent-ink:${selected ? categories[selected.category as keyof typeof categories].foreground : 'var(--ink)'}`} >
  <div class="section-meta"><span>01 / Programação</span><span>Arte com hora e lugar.</span></div>
  <header><h2 id="events-heading">Na agenda<span>.</span></h2><p>O próximo encontro<br />pode estar aqui.</p></header>
  <div bind:this={region} role="region" aria-roledescription="carrossel" aria-label="Eventos culturais">
    {#if selected}
      {#key selected.slug}
        <article class="slide" aria-roledescription="slide" aria-label={`${index + 1} de ${events.length}`}>
          <div class="poster-wrap"><img class="poster" class:duotone={selected.posterIsPhoto} src={`${base}/cartazes/${selected.slug}.jpg`} alt={`Cartaz de ${selected.title}`} width={selected.posterWidth} height={selected.posterHeight} loading="lazy" decoding="async" /><span class="poster-caption">Culturando / {String(index + 1).padStart(2, '0')}</span></div>
          <div class="information">
            <div class="date numerals"><time datetime={selected.date}>{displayDate(selected.date)}</time><span>{selected.time}</span></div>
            <h3>{selected.title.replace(/^Exemplo fictício\s*[—-]\s*/, '')}</h3>
            <span class="category">{selected.category}</span>
            {#if selected.example}<p class="example">Exemplo fictício · não é um evento real</p>{/if}
            <p class="venue">{venue?.nome || 'Online ou sem local fixo'}</p>
            {#if venue}<p class="address">{venue.endereço}</p>{/if}
            {#if selected.endDate}<p class="until">Até {displayDate(selected.endDate)}</p>{/if}
            <p class="description">{selected.summary}</p>
            <a class="event-link" href={`${base}/eventos/${selected.slug}/`}>Sobre o evento <Arrow direction="up-right" /></a>
            {#if selected.link}<a class="organization" href={selected.link} rel="noopener noreferrer">Informações com a organização <Arrow direction="up-right" /></a>{/if}
          </div>
        </article>
      {/key}
      <div class="controls"><p class="numerals"><strong>{String(index + 1).padStart(2, '0')}</strong> / {String(events.length).padStart(2, '0')}<span>Sem pressa. Tem mais.</span></p><div><button aria-label="Evento anterior" onclick={() => step(-1)} disabled={events.length < 2}><Arrow direction="left" /></button><button aria-label="Próximo evento" onclick={() => step(1)} disabled={events.length < 2}><Arrow /></button></div></div>
      <p class="sr-only" aria-live="polite" aria-atomic="true">Evento {index + 1} de {events.length}: {selected.title}</p>
    {:else}<p class="empty">Nenhum evento nesta seleção por enquanto.</p>{/if}
  </div>
</section>
<style>
  .events { padding: 3.5rem var(--gutter) 4.5rem; }
  header { display: flex; align-items: end; justify-content: space-between; padding: 2.3rem 0 3rem; }
  header h2 span { color: var(--coral); }
  header p { font-size: .85rem; }
  .slide { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(2rem, 7vw, 7rem); align-items: center; }
  .poster-wrap { position: relative; padding: 1.8rem 3.5rem 2.7rem; background: var(--poster-surface); isolation: isolate; }
  .poster { width: 100%; height: auto; max-height: 600px; object-fit: contain; transform: rotate(-3deg); box-shadow: 7px 9px 0 #25203535; animation: reveal .55s cubic-bezier(.2,.8,.3,1) both; }
  .poster-caption { position: absolute; bottom: .8rem; right: 1rem; font-size: .55rem; letter-spacing: .14em; color: var(--ink); background: var(--paper); padding: .15rem .3rem; }
  .information { padding: 1rem 0; animation: arrive .4s both; }
  .date { display: flex; justify-content: space-between; gap: .5rem; font-size: .8rem; padding-bottom: .8rem; border-bottom: var(--line); }
  h3 { font-size: clamp(2.7rem, 5.8vw, 5.8rem); margin: 1.3rem 0 .8rem; max-width: 12ch; font-stretch: 85%; overflow-wrap: anywhere; }
  .category { display: inline-block; background: var(--accent); color: var(--accent-ink); border-bottom: 2px solid var(--ink); padding: .15rem .4rem; text-transform: uppercase; font-size: .65rem; letter-spacing: .12em; font-weight: 700; }
  .example { font-size: .65rem; margin: .9rem 0; }
  .venue { font-weight: 700; margin-top: 1.3rem; }
  .address,.until { font-size: .8rem; margin-top: .25rem; }
  .description { margin-top: 1.1rem; font-size: .9rem; max-width: 38ch; }
  .event-link { margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: var(--ink); color: var(--paper); padding: .9rem 1.1rem; text-decoration: none; font-size: .85rem; font-weight: 700; max-width: 22rem; }
  .event-link:hover { background: var(--coral); color: var(--ink); }
  .organization { display: flex; align-items: center; gap: .5rem; font-size: .75rem; margin-top: .8rem; }
  .controls { display: flex; align-items: center; justify-content: space-between; margin-top: 2rem; border-top: var(--line); padding-top: 1rem; }
  .controls p { font-size: .85rem; }
  .controls strong { font-size: 1.4rem; font-weight: 500; }
  .controls p span { margin-left: 2rem; font-size: .7rem; }
  .controls > div { display: flex; gap: .6rem; }
  button { border: var(--line); background: transparent; width: 3rem; height: 3rem; display: grid; place-items: center; font-size: 1.3rem; }
  button:hover:not(:disabled) { background: var(--ink); color: var(--paper); }
  .empty { padding: 6rem 0; font-size: 1.2rem; }
  @keyframes reveal { from { clip-path: inset(0 100% 0 0); transform: rotate(-1deg); } to { clip-path: inset(0); transform: rotate(-3deg); } }
  @keyframes arrive { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 700px) {
    .events { padding-top: 2rem; padding-bottom: 3rem; }
    header { padding: 1.7rem 0 2rem; align-items: center; }
    header p { display: none; }
    header h2 { font-size: clamp(3rem, 13vw, 5rem); white-space: nowrap; }
    .slide { grid-template-columns: 1fr; gap: 1rem; }
    .poster-wrap { padding: 1.6rem 2.5rem 2rem; }
    .poster { max-height: 430px; }
    h3 { font-size: clamp(3rem, 12vw, 4.5rem); max-width: 14ch; }
    .information { padding-top: .5rem; }
    .controls p span { display: none; }
  }
</style>
