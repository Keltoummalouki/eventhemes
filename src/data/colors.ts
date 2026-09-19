/**
 * Teintes nommées proposées par <ColorInput> : choisir une couleur dans le
 * sélecteur remplit le nom le plus proche de cette liste. Des noms stables
 * (« Doré », pas « or », « gold » ou « doré ») gardent le filtre « couleur »
 * du catalogue lisible.
 */
export const colorNames: readonly { name: string; hex: string }[] = [
  { name: 'Blanc', hex: '#ffffff' },
  { name: 'Ivoire', hex: '#f5f1e8' },
  { name: 'Crème', hex: '#efe0bd' },
  { name: 'Beige', hex: '#d6c2a1' },
  { name: 'Champagne', hex: '#e4c779' },
  { name: 'Doré', hex: '#c9a34e' },
  { name: 'Cuivré', hex: '#b87333' },
  { name: 'Argenté', hex: '#c0c0c0' },
  { name: 'Gris', hex: '#8a8a8a' },
  { name: 'Anthracite', hex: '#383838' },
  { name: 'Noir', hex: '#0a0a0a' },
  { name: 'Bois naturel', hex: '#b08560' },
  { name: 'Marron', hex: '#6b4226' },
  { name: 'Rouge', hex: '#c0392b' },
  { name: 'Bordeaux', hex: '#6d1a2b' },
  { name: 'Rose poudré', hex: '#e8c4c4' },
  { name: 'Rose', hex: '#e07a9a' },
  { name: 'Orange', hex: '#e67e22' },
  { name: 'Jaune', hex: '#f1c40f' },
  { name: 'Vert sauge', hex: '#9caf88' },
  { name: 'Vert', hex: '#3f8f4f' },
  { name: 'Turquoise', hex: '#30b5b0' },
  { name: 'Bleu', hex: '#2f6fbf' },
  { name: 'Bleu marine', hex: '#1f2a44' },
  { name: 'Violet', hex: '#7d4e9e' },
];
