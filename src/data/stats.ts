export type Stat = {
  value: number;
  suffix: string;
  label: string;
};

export const STATS: readonly Stat[] = [
  { value: 500, suffix: '+', label: 'Événements réalisés' },
  { value: 300, suffix: '+', label: 'Clients satisfaits' },
  { value: 10, suffix: '+', label: "Années d'expérience" },
  { value: 50, suffix: '+', label: 'Solutions événementielles' },
];
