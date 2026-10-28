<script lang="ts">
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import Hero from '$lib/hero/Hero.svelte';
  import Island from '$lib/nav/Island.svelte';
  import Carousel from '$lib/events/Carousel.svelte';
  import CityMap from '$lib/map/CityMap.svelte';
  import { localDate } from '$lib/content/dates';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  let today = $state('');
  let selectedSlug = $state('');
  let category = $state('');
  const visible = $derived(today ? data.events.filter((event) => (event.endDate || event.date) >= today) : []);
  const filtered = $derived(category ? visible.filter((event) => event.category === category) : visible);
  const selected = $derived(filtered.find((event) => event.slug === selectedSlug) || filtered[0]);
  function select(slug: string) { selectedSlug = slug; replaceState(`#${slug}`, {}); }
  onMount(() => {
    const refresh = () => { today = localDate(new Date()); };
    const readHash = () => {
      const slug = location.hash.slice(1);
      if (data.events.some((event) => event.slug === slug)) {
        category = ''; selectedSlug = slug;
        requestAnimationFrame(() => document.getElementById('eventos')?.scrollIntoView({ behavior: 'instant' }));
      }
    };
    refresh(); readHash();
    const timer = setInterval(refresh, 30_000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('hashchange', readHash);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('hashchange', readHash); };
  });
</script>
<svelte:head><title>Culturando — Agenda cultural de Palmas</title><meta name="description" content="Agenda cultural de Palmas, Tocantins. Datas, horários e locais dos eventos." /></svelte:head>
<Island />
<main id="conteudo">
  <Hero events={visible} />
  <div class="event-anchors" aria-hidden="true">{#each data.events as event (event.slug)}<span id={event.slug}></span>{/each}</div>
  <div id="eventos">{#if today}<Carousel events={filtered} venues={data.venues} {selected} onselect={select} />{:else}<div class="loading" aria-live="polite">Conferindo a programação de hoje…</div>{/if}</div>
  <CityMap events={filtered} allEvents={visible} venues={data.venues} {selected} {category} oncategory={(value) => category = value} onselect={select} />
  <noscript>Ative o JavaScript para consultar a programação atualizada.</noscript>
  <section id="sobre" class="about" aria-labelledby="about-heading">
    <div class="section-meta"><span>03 / Sobre o Culturando</span><span>Daqui. Para quem está aqui.</span></div>
    <div class="about-copy"><h2 id="about-heading">Cultura<br />em Palmas<span>.</span></h2><div><p>A programação cultural da cidade, em um lugar.</p><p>Consulte datas, horários e informações de cada evento. Use as categorias para escolher a programação ou veja no mapa os eventos com endereço cadastrado.</p><a href="#eventos">Voltar à programação ↑</a></div></div>
  </section>
  <footer><a href="#inicio" class="footer-mark">CULTURANDO</a><div><span>Seu mapa cultural.</span><span>Palmas, Tocantins / Brasil</span></div><a href="#inicio">De volta ao começo ↑</a></footer>
</main>
<style>
  .event-anchors { position: relative; }
  .event-anchors span { position: absolute; top: 0; pointer-events: none; }
  .loading { padding: 5rem var(--gutter); }
  .about { padding: 4rem var(--gutter) 5rem; background: var(--sun); }
  .about-copy { display: grid; grid-template-columns: 1fr 1fr; gap: 6vw; padding-top: 3rem; align-items: end; }
  .about h2 { font-size: clamp(4rem, 8vw, 8.5rem); }
  .about h2 span { color: var(--ink); }
  .about-copy > div { max-width: 29rem; }
  .about p:first-child { font-family: var(--display); font-size: clamp(1.5rem, 2.4vw, 2.6rem); font-weight: 700; line-height: 1.05; letter-spacing: -.04em; margin-bottom: 1.5rem; }
  .about p { font-size: .95rem; }
  .about a { display: inline-block; margin-top: 2rem; font-size: .8rem; }
  footer { padding: 2.5rem var(--gutter) 2rem; }
  .footer-mark { display: block; font-family: var(--display); font-weight: 900; font-size: clamp(3rem, 13.5vw, 14rem); line-height: 1; letter-spacing: -.075em; text-decoration: none; }
  footer > div { display: flex; justify-content: space-between; gap: 1rem; border-top: var(--line); padding-top: 1rem; font-size: .7rem; }
  footer > a:last-child { display: block; margin-top: 2rem; text-align: right; font-size: .65rem; }
  @media (max-width: 700px) { .about { padding-top: 2rem; padding-bottom: 3rem; } .about-copy { grid-template-columns: 1fr; gap: 2rem; padding-top: 2rem; } .section-meta { font-size: .55rem; } .footer-mark { font-size: 11.8vw; } }
</style>
