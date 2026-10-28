<script lang="ts">
  let { direction = 'right' }: { direction?: 'right' | 'left' | 'down' | 'up-right' } = $props();
  const angle = $derived(({ right: 0, left: 180, down: 90, 'up-right': -45 })[direction]);
</script>
<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={`transform:rotate(${angle}deg)`}><path d="M3 12h17M12 4l8 8-8 8" stroke="currentColor" stroke-width="1.8" /></svg>
