<script lang="ts">
  import { onMount } from 'svelte';
  let expanded = $state(false);
  let active = $state('inicio');
  let island: HTMLElement;
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) active = entry.target.id;
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('#inicio, #eventos, #mapa, #sobre').forEach((section) => observer.observe(section));
    const outside = (event: PointerEvent) => { if (!island.contains(event.target as Node)) expanded = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && island.contains(document.activeElement)) { expanded = false; island.querySelector('button')?.focus(); } };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    return () => { observer.disconnect(); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  });
</script>
<nav bind:this={island} class:expanded aria-label="Principal" onmouseenter={() => expanded = true} onmouseleave={() => { if (!island.contains(document.activeElement)) expanded = false; }}>
  <button class="toggle" aria-label="Abrir navegação" aria-expanded={expanded} aria-controls="island-links" onclick={() => expanded = !expanded}>C. <span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
  <div id="island-links" hidden={!expanded}>
    {#each [['eventos', 'Eventos'], ['mapa', 'Mapa'], ['sobre', 'Sobre']] as [id, label]}
      <a href={`#${id}`} aria-current={active === id ? 'location' : undefined} onclick={() => expanded = false}>{label}</a>
    {/each}
  </div>
</nav>
<style>
  nav { position: fixed; top: 1.3rem; right: var(--gutter); z-index: 50; display: flex; align-items: center; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); border-radius: 3rem; padding: .4rem; box-shadow: 4px 5px 0 #25203525; }
  .toggle { background: transparent; border: 0; color: inherit; display: flex; gap: 1rem; align-items: center; padding: .45rem .8rem; font-family: var(--display); font-weight: 850; letter-spacing: -.05em; }
  .toggle span { color: var(--coral); font-size: 1.4rem; line-height: 1; }
  #island-links:not([hidden]) { display: flex; padding-right: .45rem; }
  a { padding: .5rem .65rem; font-size: .78rem; text-decoration: none; position: relative; }
  a[aria-current]::after { content: ''; position: absolute; bottom: 0; left: calc(50% - 2px); width: 4px; height: 4px; background: var(--coral); border-radius: 50%; }
  a:hover { color: var(--sun); }
  nav :focus-visible { outline-color: var(--sun); box-shadow: none; outline-offset: 0; border-radius: 1rem; }
  @media (max-width: 550px) { nav { top: .8rem; right: 1rem; } .toggle { padding: .4rem .6rem; } a { padding: .45rem .5rem; } }
</style>
