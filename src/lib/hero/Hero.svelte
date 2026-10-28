<script lang="ts">
  import { onMount } from 'svelte';
  import Arrow from '$lib/nav/Arrow.svelte';
  import { base } from '$app/paths';
  import type { Event } from '$lib/events/types';
  let { events }: { events: Event[] } = $props();
  let wall: HTMLElement;
  let x = $state(0);
  let y = $state(0);
  let paused = $state(true);
  const fragments = $derived(events.slice(0, 6));
  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => paused = !entry.isIntersecting);
    observer.observe(wall);
    return () => observer.disconnect();
  });
  function move(event: PointerEvent) {
    if (paused || event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = wall.getBoundingClientRect();
    x = ((event.clientX - box.left) / box.width - .5) * 24;
    y = ((event.clientY - box.top) / box.height - .5) * 24;
  }
</script>
<section id="inicio" class="hero" bind:this={wall} onpointermove={move} onpointerleave={() => { x = 0; y = 0; }} aria-labelledby="wordmark" style={`--x:${x}px;--y:${y}px`}>
  <div class="masthead"><span>Palmas, Tocantins</span><span>Cultura fora da moldura.</span></div>
  <h1 id="wordmark"><span class="sr-only">SEMNOME — Seu mapa cultural</span>
    <svg class="wordmark" viewBox="0 0 1400 270" aria-hidden="true">
      <defs>
        <mask id="letter-windows"><rect width="1400" height="270" fill="black" /><text x="0" y="240" textLength="1390" lengthAdjust="spacingAndGlyphs" fill="white">SEMNOME</text></mask>

      </defs>
      <g mask="url(#letter-windows)">
        <rect width="1400" height="270" fill="var(--ink)" />
        {#each fragments.slice(0, 3) as event, index (event.slug)}
          <image class="window-image" href={`${base}/cartazes/${event.slug}.jpg`} width="1400" height="1250" y="-380" preserveAspectRatio="xMidYMid slice" filter="url(#duotone)" style={`--delay:${index * -6}s;animation-play-state:${paused ? 'paused' : 'running'}`} />
        {/each}
      </g>
    </svg>
  </h1>
  <div class="wall" aria-hidden="true" class:paused>
    {#each fragments as event, index (event.slug)}
      <div class={`fragment fragment-${index}`} style={`--depth:${(index % 3 + 1) / 3};--rotation:${[-9, 7, -5, 10, -8, 5][index]}deg;--delay:${index * -1.7}s`}>
        <div class="paper"><img src={`${base}/cartazes/${event.slug}.jpg`} alt="" width="200" height="250" /><span>{event.category} / Palmas</span></div>
      </div>
    {/each}
  </div>
  <div class="hero-bottom">
    <p class="strap">Seu mapa cultural<span><Arrow direction="up-right" /></span></p>
    <div class="intro"><p>Tem arte acontecendo.<br />A cidade é o ponto de encontro.</p><a href="#eventos">Ver a programação <span aria-hidden="true">↓</span></a></div>
  </div>
  <div class="footnote"><span>Uma agenda feita de gente e lugar.</span><span>Role. A cidade continua. ↓</span></div>
</section>
<style>
  .hero { position: relative; min-height: min(940px, 105svh); padding: 2rem var(--gutter) 0; overflow: hidden; isolation: isolate; }
  .masthead { display: flex; gap: 2.5rem; text-transform: uppercase; letter-spacing: .12em; font-size: .65rem; padding-top: .4rem; }
  h1 { margin-top: clamp(4rem, 7vw, 7rem); position: relative; z-index: 1; }
  .wordmark { width: 100%; overflow: visible; display: block; }
  .wordmark text { font-family: var(--display); font-size: 280px; font-weight: 900; letter-spacing: -.05em; }
  .window-image { opacity: 0; animation: images 18s infinite; animation-delay: var(--delay); }
  @keyframes images { 0%, 28% { opacity: .88; } 34%, 94% { opacity: 0; } }
  .wall { position: absolute; top: 40%; left: 0; width: 100%; height: 40%; pointer-events: none; }
  .fragment { position: absolute; width: clamp(110px, 13.5vw, 210px); transform: translate3d(calc(var(--x) * var(--depth)), calc(var(--y) * var(--depth)), 0) rotate(var(--rotation)); transition: transform .7s cubic-bezier(.2,.7,.3,1); }
  .paper { padding: .45rem; background: var(--paper); border: 1px solid var(--ink); box-shadow: 5px 6px 0 #25203528; }
  .paper img { width: 100%; height: auto; aspect-ratio: 4/5; object-fit: cover; filter: url(#duotone); }
  .paper span { display: block; font-size: .46rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-top: .35rem; }
  .fragment-0 { left: -2%; top: 12%; }
  .fragment-1 { left: 15%; top: -5%; }
  .fragment-2 { left: 34%; top: 25%; z-index: 2; }
  .fragment-3 { left: 53%; top: 4%; }
  .fragment-4 { left: 73%; top: 25%; z-index: 2; }
  .fragment-5 { left: 91%; top: -9%; }
  .hero-bottom { position: relative; margin-top: clamp(12rem, 23vw, 19rem); display: flex; justify-content: space-between; align-items: center; gap: 2rem; padding-bottom: 2rem; z-index: 4; }
  .strap { font-family: var(--display); font-weight: 850; letter-spacing: -.06em; line-height: 1; font-size: clamp(1.7rem, 4vw, 4rem); background: var(--coral); transform: rotate(-1.8deg); padding: .25em .4em .32em; box-shadow: 4px 5px 0 var(--ink); white-space: nowrap; }
  .strap span { margin-left: .55em; }
  .intro { font-size: .85rem; max-width: 17rem; }
  .intro a { display: inline-block; margin-top: 1rem; font-weight: 700; }
  .intro a span { margin-left: 2rem; }
  .footnote { display: flex; justify-content: space-between; font-size: .6rem; text-transform: uppercase; letter-spacing: .08em; border-top: var(--line); padding: .9rem 0; }
  @media (max-width: 700px) {
    .hero { min-height: 780px; min-height: 95svh; padding-top: 1.5rem; }
    .masthead span:last-child { display: none; }
    h1 { margin-top: 5rem; margin-left: -.4rem; width: calc(100% + .8rem); }
    .wall { top: 29%; height: 32%; }
    .fragment { width: 27vw; max-width: 150px; transition: none; }
    .paper { animation: drift 7s ease-in-out infinite alternate; animation-delay: var(--delay); }
    .paused .paper { animation-play-state: paused; }
    .fragment-0 { left: -8%; top: 5%; }
    .fragment-1 { left: 21%; top: 0; }
    .fragment-2 { left: 55%; top: 5%; }
    .fragment-3 { left: 86%; top: -5%; }
    .fragment-4 { left: 5%; top: 65%; }
    .fragment-5 { left: 73%; top: 60%; }
    .hero-bottom { margin-top: 38svh; flex-direction: column; align-items: flex-start; gap: 1.4rem; padding-bottom: 1.5rem; }
    .strap { font-size: clamp(1.7rem, 7.6vw, 3rem); }
    .intro { max-width: none; display: flex; justify-content: space-between; width: 100%; gap: 1rem; font-size: .72rem; }
    .intro a { margin-top: 0; max-width: 8rem; }
    .intro a span { margin-left: .5rem; }
    .footnote span:first-child { max-width: 11rem; }
    .footnote { gap: 1rem; font-size: .5rem; }
  }
  @keyframes drift { from { transform: translate3d(0, -4px, 0); } to { transform: translate3d(0, 4px, 0); } }
  @media (prefers-reduced-motion: reduce) { .window-image:first-of-type { opacity: .88; } }
</style>
