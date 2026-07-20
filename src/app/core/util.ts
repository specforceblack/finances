export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const PALETTE = [
  '#2f6fed', '#2f9c5a', '#d98e04', '#d23f3f', '#7b4fd6',
  '#0aa3a3', '#c2478d', '#8a6d3b', '#4a7c96', '#a3a32f',
];

export function colorForIndex(i: number): string {
  return PALETTE[i % PALETTE.length];
}
