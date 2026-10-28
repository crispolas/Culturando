export const categories = {
  'dança': { color: '#FF633E', foreground: '#252035', outline: '#252035' },
  'música': { color: '#F9D84A', foreground: '#252035', outline: '#252035' },
  'teatro': { color: '#8054E8', foreground: '#FFFFFF', outline: '#252035' },
  'exposição': { color: '#67C9B2', foreground: '#252035', outline: '#252035' },
  'festival': { color: '#252035', foreground: '#F3EEE4', outline: '#FF633E' },
  'oficina': { color: '#252035', foreground: '#F3EEE4', outline: '#F9D84A' },
  'outros': { color: '#252035', foreground: '#F3EEE4', outline: '#67C9B2' }
} as const;
export type Category = keyof typeof categories;
