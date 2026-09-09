export type ProcessStep = {
  title: string;
  description: string;
};

/** Les cinq étapes de l'accompagnement AURÉLYS. */
export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    title: 'Échange',
    description: 'Une première rencontre pour comprendre votre vision, vos envies et vos contraintes.',
  },
  {
    title: 'Conception',
    description: 'Nous imaginons une scénographie et un concept sur-mesure pour votre événement.',
  },
  {
    title: 'Planification',
    description: 'Coordination des prestataires, du planning et du budget dans le moindre détail.',
  },
  {
    title: 'Installation',
    description: 'Montage technique et artistique du lieu, sous la supervision de notre équipe.',
  },
  {
    title: 'Réalisation',
    description:
      "Le jour J, nous orchestrons chaque instant pour que vous puissiez simplement vivre l'événement.",
  },
];
