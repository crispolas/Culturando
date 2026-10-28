<script lang="ts">
  import { onMount } from 'svelte';
  import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import type { Map as CityMap, Marker, Popup, GeoJSONSource } from 'maplibre-gl';
  import { categories } from '$lib/events/categories';
  import type { Category } from '$lib/events/categories';
  import type { Event, Venue } from '$lib/events/types';
  import { displayDate } from '$lib/content/dates';
  import { eventPoints } from './points';
  import { cityStyle } from './style';
  import Arrow from '$lib/nav/Arrow.svelte';
  let { events, allEvents, venues, selected, category, oncategory, onselect }: {
    events: Event[]; allEvents: Event[]; venues: Venue[]; selected: Event | undefined; category: string;
    oncategory: (value: string) => void; onselect: (slug: string) => void;
  } = $props();
  let container: HTMLDivElement;
  let viewport: HTMLDivElement;
  let map = $state.raw<CityMap>();
  let status = $state<'waiting' | 'loading' | 'ready' | 'failed'>('waiting');
  let ready = $state(false);
  let fullScreen = $state(false);
  let library: typeof import('maplibre-gl');
  let popup: Popup | undefined;
  let destroyed = false;
  let loadingTimer: ReturnType<typeof setTimeout>;
  const markers = new Map<string, Marker>();
  const located = $derived(eventPoints(events, venues));
  const selectedVenue = $derived(venues.find((venue) => venue.slug === selected?.venue));
  function motion() { const box = viewport.getBoundingClientRect(); return box.bottom > 0 && box.top < innerHeight && !matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function clearMarkers() { markers.forEach((marker) => marker.remove()); markers.clear(); }
  function showPopup(event: Event, venue: Venue) {
    if (!map) return;
    popup?.remove();
    const panel = document.createElement('div'); panel.className = 'map-poster';
    const tag = document.createElement('p'); tag.className = 'popup-category'; tag.textContent = event.category;
    const palette = categories[event.category as Category]; tag.style.background = palette.color; tag.style.color = palette.foreground;
    const heading = document.createElement('h3'); heading.textContent = event.title;
    const place = document.createElement('p'); place.textContent = venue.nome;
    const date = document.createElement('p'); date.textContent = `${displayDate(event.date)} · ${event.time}`;
    const link = document.createElement('a'); link.textContent = 'Ver na agenda'; link.href = `#${event.slug}`;
    link.onclick = (click) => { click.preventDefault(); onselect(event.slug); document.getElementById('eventos')?.scrollIntoView({ behavior: motion() ? 'smooth' : 'instant' }); };
    panel.append(tag, heading, place, date, link);
    popup = new library.Popup({ offset: 25, closeButton: true, closeOnClick: false, maxWidth: '280px', focusAfterOpen: false }).setLngLat([venue.lng, venue.lat]).setDOMContent(panel).addTo(map);
    popup.getElement().querySelector('button')?.setAttribute('aria-label', 'Fechar informações do evento');
  }
  function renderMarkers() {
    if (!map || !map.getSource('events') || !map.isSourceLoaded('events')) return;
    const keep = new Set<string>();
    for (const feature of map.querySourceFeatures('events')) {
      if (feature.geometry.type !== 'Point') continue;
      const properties = feature.properties;
      if (!properties) continue;
      const cluster = Boolean(properties.cluster);
      const key = cluster ? `cluster-${properties.cluster_id}` : String(properties.slug);
      if (keep.has(key)) continue;
      keep.add(key);
      const existing = markers.get(key);
      if (existing) { existing.getElement().classList.toggle('selected', key === selected?.slug); continue; }
      const button = document.createElement('button'); button.type = 'button'; button.className = 'event-marker';
      const coordinates: [number, number] = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
      if (cluster) {
        button.classList.add('cluster-marker'); button.textContent = String(properties.point_count);
        button.setAttribute('aria-label', `${properties.point_count} eventos próximos. Aproximar mapa`);
        button.onclick = async () => {
          if (!map) return;
          const source = map.getSource('events') as GeoJSONSource;
          const zoom = await source.getClusterExpansionZoom(Number(properties.cluster_id));
          map.easeTo({ center: coordinates, zoom, duration: motion() ? 600 : 0 });
        };
      } else {
        const event = events.find((item) => item.slug === properties.slug);
        const venue = venues.find((place) => place.slug === event?.venue);
        if (!event || !venue) continue;
        const palette = categories[event.category as Category];
        button.style.background = palette.color; button.style.color = palette.foreground; button.style.borderColor = palette.outline;
        button.textContent = event.category.slice(0, 1).toUpperCase();
        button.setAttribute('aria-label', `${event.title}, ${venue.nome}`);
        button.classList.toggle('selected', event.slug === selected?.slug);
        button.onclick = (click) => { click.stopPropagation(); onselect(event.slug); showPopup(event, venue); };
      }
      markers.set(key, new library.Marker({ element: button }).setLngLat(coordinates).addTo(map));
    }
    for (const [key, marker] of markers) if (!keep.has(key)) { marker.remove(); markers.delete(key); }
  }
  async function initialize() {
    if (status === 'loading' || destroyed) return;
    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(() => { if (!destroyed && status === 'loading') status = 'failed'; }, 12_000);
    status = 'loading'; ready = false; popup?.remove(); clearMarkers(); map?.remove(); map = undefined;
    try {
      library = await import('maplibre-gl');
      library.setWorkerUrl(workerUrl);
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (destroyed) return;
      map = new library.Map({
        container, style: cityStyle, center: [-48.33, -10.18], zoom: 11.3, minZoom: 9, maxZoom: 17,
        maxBounds: [[-48.72, -10.62], [-48.02, -9.76]], attributionControl: false, cooperativeGestures: true,
        locale: { 'NavigationControl.ZoomIn': 'Aproximar mapa', 'NavigationControl.ZoomOut': 'Afastar mapa', 'NavigationControl.ResetBearing': 'Orientar para o norte', 'AttributionControl.ToggleAttribution': 'Alternar créditos', 'Map.Title': 'Mapa cultural de Palmas', 'Popup.Close': 'Fechar informações do evento', 'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl e a roda do mouse para aproximar', 'CooperativeGesturesHandler.MacHelpText': 'Use a tecla de comando e a roda do mouse para aproximar', 'CooperativeGesturesHandler.MobileHelpText': 'Use dois dedos para mover o mapa' }
      });
      map.addControl(new library.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new library.AttributionControl({ compact: false }), 'bottom-left');
      map.on('load', () => {
        clearTimeout(loadingTimer);
        if (!map) return;
        map.addSource('events', { type: 'geojson', data: eventPoints(events, venues), cluster: true, clusterRadius: 50, clusterMaxZoom: 16 });
        map.addLayer({ id: 'event-points', type: 'circle', source: 'events', paint: { 'circle-radius': 1, 'circle-opacity': 0 } });
        ready = true; if (status !== 'failed') status = 'ready';
        map.on('render', renderMarkers);
        renderMarkers();
      });
      map.on('error', () => { clearTimeout(loadingTimer); status = 'failed'; });
      map.getCanvas().setAttribute('aria-label', 'Mapa de Palmas. Os eventos com local também estão disponíveis no carrossel.');
    } catch (error) {
      clearTimeout(loadingTimer); status = 'failed'; console.warn('O mapa não pôde ser iniciado.', error);
    }
  }
  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { void initialize(); observer.disconnect(); } }, { rootMargin: '150px' });
    observer.observe(viewport);
    const escape = (event: KeyboardEvent) => { if (!fullScreen) return;
      if (event.key === 'Escape') { fullScreen = false; viewport.querySelector<HTMLButtonElement>('.fullscreen-button')?.focus(); requestAnimationFrame(() => map?.resize()); }
      if (event.key === 'Tab') {
        const focusable = Array.from(viewport.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], canvas[tabindex]')).filter((element) => element.getClientRects().length > 0);
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      } };
    document.addEventListener('keydown', escape);
    return () => { destroyed = true; clearTimeout(loadingTimer); observer.disconnect(); document.removeEventListener('keydown', escape); popup?.remove(); clearMarkers(); map?.remove(); };
  });
  $effect(() => {
    const data = located;
    if (ready && map) { clearMarkers(); (map.getSource('events') as GeoJSONSource).setData(data); }
  });
  $effect(() => {
    if (!ready || !map) return;
    const event = selected;
    const venue = selectedVenue;
    if (event && venue) { map.easeTo({ center: [venue.lng, venue.lat], zoom: Math.max(map.getZoom(), 13), duration: motion() ? 650 : 0 }); showPopup(event, venue); }
    else popup?.remove();
    renderMarkers();
  });
  $effect(() => {
    if (!fullScreen) return;
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  });
  function toggleFullScreen() {
    fullScreen = !fullScreen;
    requestAnimationFrame(() => map?.resize());
  }
</script>
<section id="mapa" class="map-section" aria-labelledby="map-heading">
  <header><h2 id="map-heading">Mapa</h2></header>
  <div class="filters" aria-label="Filtrar eventos por categoria">
    <button class:active={category === ''} aria-pressed={category === ''} onclick={() => oncategory('')}>Tudo <span>{allEvents.length}</span></button>
    {#each Object.entries(categories) as [name, palette]}
      <button class:active={category === name} style={`--tag:${palette.color};--tag-ink:${palette.foreground};--tag-border:${palette.outline}`} aria-pressed={category === name} onclick={() => oncategory(category === name ? '' : name)}>{name}<span>{allEvents.filter((event) => event.category === name).length}</span></button>
    {/each}
  </div>
  <div class="map-frame" class:fullscreen={fullScreen} bind:this={viewport} role={fullScreen ? 'dialog' : undefined} aria-modal={fullScreen ? true : undefined} aria-label={fullScreen ? 'Mapa cultural de Palmas ampliado' : undefined}>
    <div bind:this={container} class="map-canvas"></div>
    <span class="map-label">PALMAS<span>O encontro é por aqui.</span></span>
    <button class="fullscreen-button" onclick={toggleFullScreen} aria-pressed={fullScreen}>{fullScreen ? 'Fechar mapa' : 'Ampliar mapa'} <Arrow direction="up-right" /></button>
    {#if status !== 'ready'}
      <div class="map-status" role="status">
        <p>{status === 'failed' ? 'O mapa não carregou.' : 'Carregando a cidade…'}</p>
        {#if status === 'failed'}<span>A programação continua disponível na agenda.</span><button onclick={() => void initialize()}>Tentar novamente</button>{/if}
      </div>
    {/if}
    <div class="map-panel">
      <div><span class="panel-label">Ponto de encontro</span><p>{selectedVenue?.nome || 'Cultura também acontece sem endereço fixo.'}</p><span class="panel-note">{selectedVenue?.endereço || `${events.length - located.features.length} evento(s) online ou sem local fixo nesta seleção.`}</span></div>
      {#if selected}<a href="#eventos" onclick={() => { if (fullScreen) toggleFullScreen(); }}>Ver na agenda <Arrow /></a>{/if}
    </div>
  </div>
  <div class="map-note"><p>{located.features.length} evento(s) com local nesta seleção. Sem endereço fixo? O evento continua na agenda.</p><span>Dados &#169; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://openmaptiles.org/">OpenMapTiles</a></span></div>
</section>
<style>
  .map-section { padding: 1.5rem var(--gutter) 2rem; }
  header { display: flex; justify-content: space-between; align-items: end; padding: .5rem 0 1rem; }
  header h2 { font-size: clamp(2rem, 3vw, 3rem); }
  .filters { display: flex; flex-wrap: wrap; gap: .35rem 1.1rem; margin: .5rem 0 1.5rem; align-items: center; }
  .filters button { --tag: var(--mint); --tag-ink: var(--ink); --tag-border: var(--ink); border: 0; border-bottom: 2px solid transparent; padding: .25rem .1rem; background: transparent; font-family: var(--display); letter-spacing: -.04em; font-size: clamp(1rem, 1.65vw, 1.6rem); font-weight: 750; }
  .filters button:hover { border-color: var(--ink); }
  .filters button.active { background: var(--tag); color: var(--tag-ink); border-color: var(--tag-border); padding-inline: .4rem; transform: rotate(-2deg); }
  .filters span { font-family: var(--body); font-weight: 500; vertical-align: super; font-size: .55rem; margin-left: .4rem; letter-spacing: 0; }
  .map-frame { position: relative; height: 660px; border: 1px solid var(--ink); background: var(--paper); isolation: isolate; }
  .map-canvas { position: absolute; inset: 0; }
  .map-label { position: absolute; left: 1.5rem; top: 1.5rem; pointer-events: none; font-family: var(--display); font-weight: 850; font-size: 1.2rem; letter-spacing: -.04em; }
  .map-label span { display: block; font: .6rem var(--body); letter-spacing: .03em; margin-top: .2rem; }
  .fullscreen-button { position: absolute; right: 3rem; top: .7rem; background: var(--paper); border: var(--line); display: flex; align-items: center; gap: .8rem; padding: .65rem .8rem; font-size: .65rem; }
  .map-status { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); width: min(85%, 21rem); padding: 1.5rem; background: var(--paper); border: var(--line); box-shadow: 5px 6px 0 var(--ink); }
  .map-status p { font-family: var(--display); font-weight: 800; font-size: 1.7rem; letter-spacing: -.05em; line-height: 1; }
  .map-status span { display: block; font-size: .8rem; margin-top: .7rem; }
  .map-status button { margin-top: 1rem; border: var(--line); background: var(--mint); color: var(--ink); padding: .5rem .75rem; font-size: .75rem; }
  .map-panel { position: absolute; bottom: 2.2rem; left: 1rem; right: 1rem; padding: 1rem 1.2rem; background: var(--mint); color: var(--ink); border: var(--line); box-shadow: 4px 4px 0 var(--ink); display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
  .panel-label { font-size: .55rem; text-transform: uppercase; letter-spacing: .1em; }
  .map-panel p { font-family: var(--display); font-weight: 750; letter-spacing: -.035em; font-size: 1.2rem; line-height: 1.1; margin: .35rem 0; }
  .panel-note { font-size: .65rem; }
  .map-panel a { font-size: .7rem; display: flex; gap: .7rem; white-space: nowrap; align-items: center; }
  .map-note { display: flex; justify-content: space-between; gap: 2rem; margin-top: 1rem; font-size: .6rem; }
  .map-note p { max-width: 35rem; }
  .fullscreen { position: fixed; inset: 0; z-index: 60; height: 100dvh; }
  .map-section :global(.maplibregl-map), :global(.maplibregl-ctrl) { font-family: var(--body); }
  .map-section :global(.maplibregl-ctrl-attrib) { background: var(--paper); color: var(--ink); font-size: 11px; }
  .map-section :global(.maplibregl-ctrl-group) { border-radius: 0; background: var(--paper); box-shadow: 2px 2px 0 var(--ink); }
  .map-section :global(.event-marker) { width: 38px; height: 42px; border: 2px solid var(--ink); border-radius: 50% 50% 50% 0; font: 800 16px var(--display); box-shadow: 2px 3px 0 #25203540; }
  .map-section :global(.event-marker.selected) { outline: 3px solid var(--ink); outline-offset: 4px; }
  .map-section :global(.cluster-marker) { width: 46px; height: 46px; border-radius: 50%; background: var(--ink); color: var(--paper); border: 4px double var(--paper); }
  .map-section :global(.maplibregl-popup-content) { padding: 0; background: var(--paper); color: var(--ink); border-radius: 0; box-shadow: 5px 6px 0 var(--ink); border: 1px solid var(--ink); }
  .map-section :global(.maplibregl-popup-tip) { display: none; }
  .map-section :global(.map-poster) { padding: 1rem; }
  .map-section :global(.map-poster h3) { font: 850 1.6rem/.95 var(--display); letter-spacing: -.05em; margin: .8rem 0; }
  .map-section :global(.map-poster p) { font-size: .75rem; margin-top: .4rem; }
  .map-section :global(.map-poster .popup-category) { display: inline-block; padding: .15rem .4rem; font-size: .55rem; letter-spacing: .1em; text-transform: uppercase; }
  .map-section :global(.map-poster a) { display: inline-block; margin-top: .7rem; font-size: .7rem; font-weight: 700; }
  .map-section :global(.maplibregl-popup-close-button) { font-family: var(--body); background: var(--paper); color: var(--ink); width: 1.4rem; height: 1.4rem; font-size: 1rem; }
  .map-section :global(:focus-visible) { outline: 3px solid var(--ink); outline-offset: 4px; box-shadow: 0 0 0 6px var(--paper); }
  @media (max-width: 700px) {
    .map-section { padding-top: 2rem; padding-bottom: 2.5rem; }
    header { padding: 0 0 1rem; }
    header h2 { font-size: 2rem; }
    .filters { gap: .6rem 1rem; margin-bottom: 1.2rem; }
    .filters button { font-size: 1.15rem; min-height: 40px; }
    .map-frame { height: 75svh; min-height: 550px; margin-inline: calc(-1 * var(--gutter)); border-inline: 0; }
    .map-panel { left: .8rem; right: .8rem; bottom: 2.5rem; padding: .8rem; flex-direction: column; align-items: flex-start; gap: .6rem; }
    .map-panel p { font-size: 1.1rem; }
    .map-label { left: 1rem; }
    .fullscreen { margin-inline: 0; height: 100dvh; }
    .fullscreen-button { top: .7rem; right: 3rem; bottom: auto; font-size: .65rem; padding: .5rem; }
    .map-label { top: 4rem; }
    .map-note { flex-direction: column; gap: .5rem; font-size: .6rem; }
    .map-section :global(.maplibregl-ctrl-attrib) { max-width: calc(100vw - 1rem); font-size: 10px; }
  }
</style>
