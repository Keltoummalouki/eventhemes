/**
 * Un fichier correspond-il à l'attribut `accept` d'un champ ?
 *
 * Même règle que le sélecteur natif, appliquée aux fichiers déposés par
 * glisser-déposer (que le navigateur ne filtre pas) : types exacts
 * (« image/png »), familles (« image/* ») ou extensions (« .pdf »). Le serveur
 * reste seul juge du contenu réel.
 */
export function acceptsFile(file: { name: string; type: string }, accept?: string): boolean {
  const rules = (accept ?? '')
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) =>
    rule.startsWith('.')
      ? name.endsWith(rule)
      : rule.endsWith('/*')
        ? type.startsWith(rule.slice(0, -1))
        : type === rule,
  );
}
