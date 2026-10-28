const calendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Araguaina', year: 'numeric', month: '2-digit', day: '2-digit'
});

export function localDate(now: Date): string {
  const parts = calendar.formatToParts(now);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function isCurrent(event: { date: string; endDate?: string }, now: Date): boolean {
  return (event.endDate || event.date) >= localDate(now);
}

export function displayDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Araguaina', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(`${date}T12:00:00-03:00`));
}
