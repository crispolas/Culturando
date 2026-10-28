<script lang="ts">
  import '../styles/global.css';
  import archivo from '@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2?url';
  import atkinson from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url';
  import type { Snippet } from 'svelte';
  import { base } from '$app/paths';
  let { children }: { children: Snippet } = $props();
</script>
<svelte:head><link rel="preload" href={archivo} as="font" type="font/woff2" crossorigin="anonymous" /><link rel="preload" href={atkinson} as="font" type="font/woff2" crossorigin="anonymous" /><link rel="icon" href={`${base}/favicon.svg`} type="image/svg+xml" /><meta name="theme-color" content="#F3EEE4" /></svelte:head>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<svg width="0" height="0" aria-hidden="true" class="color-definitions"><defs><filter id="duotone" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="table" tableValues="0.145 1" /><feFuncG type="table" tableValues="0.125 0.388" /><feFuncB type="table" tableValues="0.207 0.243" /></feComponentTransfer></filter></defs></svg>
{@render children()}
