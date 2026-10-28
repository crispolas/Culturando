<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import type { Event } from '$lib/events/types';
  let { events }: { events: Event[] } = $props();
  let wall: HTMLElement;
  let paused = $state(true);
  const fragments = $derived(events.slice(0, 6));
  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => paused = !entry.isIntersecting);
    observer.observe(wall);
    return () => observer.disconnect();
  });
</script>
<section id="inicio" class="hero" bind:this={wall} aria-labelledby="wordmark">
  <h1 id="wordmark"><span class="sr-only">Culturando</span>
    <svg class="wordmark" viewBox="0 0 1400 270" aria-hidden="true">
      <defs>
        <mask id="letter-windows"><rect width="1400" height="270" fill="black" /><text x="0" y="240" textLength="1390" lengthAdjust="spacingAndGlyphs" fill="white">CULTURANDO</text></mask>

      </defs>
      <g mask="url(#letter-windows)">
        <rect width="1400" height="270" fill="var(--ink)" />
        {#each fragments.slice(0, 3) as event, index (event.slug)}
          <image class="window-image" href={`${base}/cartazes/${event.slug}.jpg?v=${event.posterRevision}`} width="1400" height="1250" y="-380" preserveAspectRatio="xMidYMid slice" filter="url(#duotone)" style={`--delay:${index * -6}s;animation-play-state:${paused ? 'paused' : 'running'}`} />
        {/each}
      </g>
    </svg>
  </h1>
</section>
<style>
  .hero { padding: 4.8rem var(--gutter) 1.2rem; overflow: hidden; }
  .wordmark { display: block; width: 100%; overflow: visible; }
  .wordmark text { font-family: var(--display); font-size: 280px; font-stretch: 75%; font-weight: 900; letter-spacing: -.05em; }
  .window-image { opacity: 0; animation: images 18s infinite; animation-delay: var(--delay); }
  @keyframes images { 0%, 28% { opacity: .88; } 34%, 94% { opacity: 0; } }
  @media (max-width: 700px) { .hero { padding-top: 4.7rem; padding-bottom: 1rem; } }
  @media (prefers-reduced-motion: reduce) { .window-image:first-of-type { opacity: .88; } }
</style>
