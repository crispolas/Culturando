<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import { base } from '$app/paths';
  import { displayDate, localDate } from '$lib/content/dates';
  import Arrow from '$lib/nav/Arrow.svelte';
  import type { Event, Venue } from './types';

  let { events, allEvents, venues, selected, request, onselect }: { events: Event[]; allEvents: Event[]; venues: Venue[]; selected: Event | undefined; request: { slug: string } | undefined; onselect: (slug: string) => void } = $props();
  let general = $state(false);
  let hovered = $state(false);
  let focused = $state(false);
  let paused = $state(false);
  let direction = $state(1);
  let opened = $state<Event>();
  let rail: HTMLDivElement;
  let track: HTMLDivElement;
  let group: HTMLDivElement;
  let dialog: HTMLDialogElement;
  let origin = $state<HTMLButtonElement>();
  let offset = 0;
  let period = 0;
  let copies = $state(2);
  let transitioning = false;
  let touchX = 0;
  let dragged = false;
  let mouseX = 0;
  let mouseOffset = 0;
  let mousePointer: number | undefined;
  let dragging = $state(false);
  const venue = $derived(venues.find((place) => place.slug === opened?.venue));

  function paint() {
    if (!period || !track) return;
    offset = (offset % period + period) % period;
    track.style.transform = `translate3d(${-offset}px,0,0)`;
  }
  function steer(value: number) {
    direction = value;
    offset += value * (group?.querySelector('button')?.getBoundingClientRect().width || 240);
    paint();
  }
  async function changePhoto(update: () => Promise<void>) {
    if (transitioning) return;
    transitioning = true;
    const image = origin?.querySelector('img');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce) {
      if (image && !opened) image.style.viewTransitionName = 'event-photo';
      const transition = document.startViewTransition(update);
      try { await transition.finished; } finally { if (image) image.style.viewTransitionName = ''; transitioning = false; }
    } else {
      await update(); transitioning = false;
    }
  }
  async function open(event: Event, button?: HTMLButtonElement) {
    if (transitioning) return;
    origin = button;
    if (location.hash.slice(1) !== event.slug) onselect(event.slug);
    await changePhoto(async () => {
      const image = origin?.querySelector('img');
      if (image) image.style.viewTransitionName = '';
      opened = event;
      await tick();
      dialog.showModal();
    });
  }
  async function close(restoreFocus = true) {
    await changePhoto(async () => {
      dialog.close(); opened = undefined;
      await tick();
      const image = origin?.querySelector('img');
      if (image) image.style.viewTransitionName = 'event-photo';
      if (restoreFocus) origin?.focus({ preventScroll: true });
      else { origin?.blur(); focused = false; }
      hovered = rail.matches(':hover');
    });
  }
  $effect(() => {
    const slug = request?.slug;
    if (slug) untrack(() => { const event = allEvents.find((item) => item.slug === slug); if (event) open(event); });
  });
  $effect(() => {
    if (opened) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previous; };
    }
  });
  onMount(() => {
    let inView = false;
    let previous = 0;
    let frame = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => inView = entry.isIntersecting);
    observer.observe(rail);
    const resize = new ResizeObserver(() => {
      period = group.getBoundingClientRect().width;
      copies = period ? Math.max(2, Math.ceil(rail.clientWidth / period) + 1) : 2;
      paint();
    });
    resize.observe(group); resize.observe(rail);
    function animate(now: number) {
      const elapsed = Math.min(now - (previous || now), 40);
      previous = now;
      if (inView && !document.hidden && !reduce.matches && !general && !hovered && !focused && !paused && !opened && mousePointer === undefined) {
        offset += direction * elapsed * .035; paint();
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); };
  });
</script>

<svelte:window
  onpointermove={(event) => {
    if (event.pointerId !== mousePointer) return;
    const distance = mouseX - event.clientX;
    if (!dragged && Math.abs(distance) <= 5) return;
    dragged = true; dragging = true;
    offset = mouseOffset + distance; paint();
  }}
  onpointerup={(event) => { if (event.pointerId === mousePointer) { mousePointer = undefined; dragging = false; } }}
  onpointercancel={(event) => { if (event.pointerId === mousePointer) { mousePointer = undefined; dragging = false; } }}
/>

<section class="events" aria-labelledby="events-heading">
  <header>
    <h2 id="events-heading">{general ? 'PROGRAMAÇÃO GERAL' : 'DESTAQUE'}</h2>
    <div class="controls">
      <button class="mode" onclick={() => general = !general}>{general ? 'DESTAQUE' : 'PROGRAMAÇÃO GERAL'} <Arrow direction="up-right" /></button>
      {#if !general}
        <button aria-label="Mover para a esquerda" aria-pressed={direction === -1} onclick={() => steer(-1)}><Arrow direction="left" /></button>
        <button aria-label={paused ? 'Retomar carrossel' : 'Pausar carrossel'} aria-pressed={paused} onclick={() => paused = !paused}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">{#if paused}<path d="M4 2 14 8 4 14Z" fill="currentColor" />{:else}<path d="M5 2V14M11 2V14" stroke="currentColor" stroke-width="3" />{/if}</svg></button>
        <button aria-label="Mover para a direita" aria-pressed={direction === 1} onclick={() => steer(1)}><Arrow /></button>
      {/if}
    </div>
  </header>
  <div bind:this={rail} class="rail" class:dragging hidden={general} role="region" aria-roledescription="carrossel" aria-label="Eventos em destaque"
    onpointerdown={(event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      mousePointer = event.pointerId; mouseX = event.clientX; mouseOffset = offset; dragged = false;
    }}
    ondragstart={(event) => event.preventDefault()}
    onpointerenter={() => hovered = true} onpointerleave={() => hovered = false}
    onfocusin={(event) => {
      focused = true;
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.photo');
      if (button?.matches(':focus-visible') && !button.dataset.copy) {
        const index = Array.from(group.children).indexOf(button);
        offset = index * (button.getBoundingClientRect().width + 18); paint(); rail.scrollLeft = 0;
      }
    }} onfocusout={(event) => focused = rail.contains(event.relatedTarget as Node)}
    ontouchstart={(event) => { touchX = event.touches[0].clientX; dragged = false; hovered = true; }}
    ontouchmove={(event) => { const x = event.touches[0].clientX; offset += touchX - x; dragged ||= Math.abs(touchX - x) > 3; touchX = x; paint(); }}
    ontouchend={() => hovered = false}>
    <div class="track" bind:this={track}>
      <div class="group" bind:this={group}>
        {#each events as event (event.slug)}
          <button class="photo" class:chosen={opened?.slug === event.slug && origin?.dataset.slug === event.slug && !origin?.dataset.copy} data-slug={event.slug} aria-label={`Abrir ${event.title}`} onclick={(click) => { if (click.detail === 0 || !dragged) open(event, click.currentTarget); }}>
            <img src={`${base}/cartazes/${event.slug}.jpg?v=${event.posterRevision}`} style:object-position={event.imagePosition || '50% 50%'} alt={event.imageAlt || `Cartaz de ${event.title}`} width="300" height="400" decoding="async" />
            <span>{event.title.replace(/^Exemplo fictício\s*[—-]\s*/, '')}{#if event.example}<small>Exemplo fictício</small>{/if}</span>
          </button>
        {/each}
      </div>
      {#each Array(copies - 1) as _, copy}
        <div class="group duplicate" aria-hidden="true" >
          {#each events as event (event.slug)}
            <button class="photo" class:chosen={opened?.slug === event.slug && origin?.dataset.copy === String(copy)} data-copy={copy} data-slug={event.slug} tabindex="-1" aria-label={`Abrir ${event.title}`} onclick={(click) => { if (click.detail === 0 || !dragged) open(event, click.currentTarget); }}>
              <img src={`${base}/cartazes/${event.slug}.jpg?v=${event.posterRevision}`} style:object-position={event.imagePosition || '50% 50%'} alt="" width="300" height="400" decoding="async" />
              <span>{event.title.replace(/^Exemplo fictício\s*[—-]\s*/, '')}{#if event.example}<small>Exemplo fictício</small>{/if}</span>
            </button>
          {/each}
        </div>
      {/each}
    </div>
  </div>
  {#if general}
    <div class="program">
      {#each allEvents as event (event.slug)}
        <button class="program-event" onclick={(click) => open(event, click.currentTarget)}>
          <img src={`${base}/cartazes/${event.slug}.jpg?v=${event.posterRevision}`} style:object-position={event.imagePosition || '50% 50%'} alt={event.imageAlt || `Cartaz de ${event.title}`} width="90" height="120" loading="lazy" />
          <span class="program-title">{event.title.replace(/^Exemplo fictício\s*[—-]\s*/, '')}{#if event.example}<small>Exemplo fictício</small>{/if}</span>
          <span class="program-date">{displayDate(event.date)} · {event.time}{#if (event.endDate || event.date) < localDate(new Date())}<small>Encerrado</small>{/if}</span>
          <Arrow direction="up-right" />
        </button>
      {/each}
    </div>
  {:else if !events.length}<p class="empty">Nenhum evento nesta seleção.</p>{/if}
  {#if selected && !opened}<p class="sr-only" aria-live="polite">{selected.title}</p>{/if}
</section>

<dialog bind:this={dialog} aria-labelledby="event-title" oncancel={(event) => { event.preventDefault(); close(); }} onclick={(event) => { if (event.target === dialog) close(false); }}>
  {#if opened}
    <article class="detail">
      <button class="close" aria-label="Fechar informações do evento" onclick={(event) => close(event.detail === 0)}>Fechar ×</button>
      <figure>
        <img class="detail-photo" style:view-transition-name="event-photo" style:object-position={opened.imagePosition || '50% 50%'} src={`${base}/cartazes/${opened.slug}.jpg?v=${opened.posterRevision}`} alt={opened.imageAlt || `Cartaz de ${opened.title}`} width={opened.posterWidth} height={opened.posterHeight} />
        <figcaption>{#if opened.example}Foto ilustrativa. {/if}{#if opened.imageSource}<a href={opened.imageSource} rel="noopener noreferrer">{opened.imageCredit}</a>{:else}{opened.imageCredit || ''}{/if}</figcaption>
      </figure>
      <div class="information">
        <p class="date numerals">{displayDate(opened.date)} · {opened.time}{#if opened.endDate} — {displayDate(opened.endDate)}{/if}</p>
        <h3 id="event-title">{opened.title.replace(/^Exemplo fictício\s*[—-]\s*/, '')}</h3>
        <p class="category">{opened.category}</p>
        {#if opened.example}<p class="example">Exemplo fictício · não é um evento real</p>{/if}
        <p class="venue">{venue?.nome || 'Online ou sem local fixo'}</p>
        {#if venue}<p>{venue.endereço}</p>{/if}
        <div class="description">{@html opened.html}</div>
        <a class="event-link" href={`${base}/eventos/${opened.slug}/`}>Página do evento <Arrow direction="up-right" /></a>
        {#if opened.link}<a class="organization" href={opened.link} rel="noopener noreferrer">Informações com a organização <Arrow direction="up-right" /></a>{/if}
      </div>
    </article>
  {/if}
</dialog>

<style>
  .events { padding: .6rem 0 1rem; }
  header { padding: 0 var(--gutter) 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
  h2 { font-size: clamp(1.6rem, 3vw, 3rem); letter-spacing: -.05em; }
  .controls { display: flex; align-items: center; gap: .4rem; }
  .controls button { min-width: 44px; min-height: 44px; border: 0; background: transparent; display: inline-flex; justify-content: center; align-items: center; gap: .7rem; }
  .controls .mode { font-size: .7rem; font-weight: 700; margin-right: .8rem; }
  .controls button:hover { background: var(--sun); }
  .rail { overflow: hidden; touch-action: pan-y; padding-block: .4rem 1rem; }
  .rail { cursor: grab; user-select: none; }
  .rail .photo { cursor: inherit; }
  .rail.dragging { cursor: grabbing; }
  .rail[hidden] { display: none; }
  .track, .group { display: flex; width: max-content; }
  .track { will-change: transform; }
  .group { gap: 1rem; padding-right: 1rem; }
  .photo { width: clamp(210px, 22vw, 340px); flex: 0 0 auto; background: transparent; border: 0; padding: 0; text-align: left; }
  .photo img { width: 100%; height: auto; aspect-ratio: 3/4; object-fit: cover; }
  .photo span { display: block; margin-top: .55rem; font-size: .85rem; font-weight: 600; }
  .chosen img { visibility: hidden; }
  .empty { padding: 2rem var(--gutter); }
  .program { padding: 0 var(--gutter); }
  .program-event { display: flex; width: 100%; align-items: center; gap: 1.5rem; padding: .8rem 0; border: 0; border-bottom: 1px solid #25203530; background: transparent; text-align: left; }
  .program-event:hover { background: var(--sun); }
  .program-event img { width: 72px; height: 96px; object-fit: cover; }
  .program-title { flex: 1; font: 750 clamp(1.2rem, 2.5vw, 2.2rem)/1 var(--display); letter-spacing: -.035em; }
  small { display: block; font: 400 .65rem/1.4 var(--body); letter-spacing: 0; margin-top: .5rem; }
  .program-date { font-size: .8rem; }
  dialog { width: 100%; height: 100dvh; max-width: none; max-height: none; margin: 0; border: 0; padding: 0; color: var(--ink); background: #25203590; }
  dialog::backdrop { background: transparent; }
  .detail { position: relative; margin: 5svh auto; width: min(90%, 1180px); max-height: 90svh; overflow-y: auto; background: var(--paper); display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1fr); gap: clamp(1.5rem, 5vw, 5rem); padding: 3rem; }
  .close { position: absolute; right: 1rem; top: .65rem; border: 0; background: transparent; padding: .5rem; font-size: .75rem; }
  figure { margin: 0; }
  .detail-photo { width: 100%; height: auto; max-height: 65svh; object-fit: contain; }
  figcaption { font-size: .6rem; margin-top: .6rem; }
  .date { font-size: .8rem; margin-bottom: 1rem; }
  h3 { font-size: clamp(2.6rem, 5vw, 4.5rem); }
  .category { margin-top: 1rem; font-size: .75rem; }
  .example { font-size: .65rem; margin-top: .6rem; }
  .venue { font-weight: 700; margin-top: 1.5rem; }
  .description { font-size: .9rem; margin-top: 1rem; line-height: 1.5; }
  .event-link, .organization { display: flex; gap: 1rem; align-items: center; margin-top: 1.5rem; font-size: .8rem; }
  @media (max-width: 700px) {
    header { flex-wrap: wrap; gap: .5rem; padding-bottom: .6rem; }
    .controls { width: 100%; justify-content: flex-end; }
    .controls .mode { margin-right: auto; padding-left: 0; }
    .photo { width: 62vw; }
    .program-event { gap: .7rem; flex-wrap: wrap; }
    .program-event img { width: 54px; height: 72px; }
    .program-title { flex-basis: calc(100% - 80px); }
    .program-date { margin-left: calc(54px + .7rem); flex: 1; font-size: .7rem; }
    .detail { margin: 1rem auto; padding: 2.8rem 1rem 1.5rem; width: calc(100% - 2rem); max-height: calc(100dvh - 2rem); grid-template-columns: 1fr; gap: 1.2rem; }
    .detail figure { width: 52%; }
    .detail-photo { max-height: 32svh; object-position: left; }
    h3 { font-size: 2.5rem; }
  }
</style>
