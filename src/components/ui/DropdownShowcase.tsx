'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Dropdown, Select, type SelectOption } from '@/components/ui';
import Button from './Button';
import s from './DropdownShowcase.module.css';

const events: SelectOption[] = [
  { value: 'mariage', label: 'Mariage', description: 'Une célébration à votre image.' },
  { value: 'anniversaire', label: 'Anniversaire', description: 'Un moment à partager.' },
  { value: 'conference', label: 'Conférence', description: 'Rencontres et événements professionnels.' },
  { value: 'team-building', label: 'Team building', description: 'Des expériences qui rassemblent.' },
  { value: 'sur-mesure', label: 'Sur mesure', description: 'Bientôt disponible.', disabled: true },
];
const equipment: SelectOption[] = [
  { value: 'chair', label: 'Chaise de réception', description: 'Mobilier · finition dorée' },
  { value: 'arch', label: 'Arche décorative', description: 'Décoration · structure florale' },
  { value: 'table', label: 'Table de réception', description: 'Mobilier · ronde ou rectangulaire' },
  { value: 'light', label: 'Éclairage d’ambiance', description: 'Technique · lumière chaude' },
  { value: 'led', label: 'Écran LED', description: 'Technique · affichage audiovisuel' },
];
const example = `import { Select } from '@/components/ui';

<Select
  label="Type d’événement"
  name="eventType"
  options={eventOptions}
  value={eventType}
  onChange={setEventType}
  required
/>

// Ajoutez searchable pour activer la recherche.`;

export default function DropdownShowcase() {
  const [event, setEvent] = useState('');
  const [item, setItem] = useState('');
  const [errorEvent, setErrorEvent] = useState('');
  const [result, setResult] = useState('Aucun événement sélectionné.');
  const [action, setAction] = useState('Aucune action déclenchée.');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setResult(`Valeur du formulaire : ${data.get('eventType')}`);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(example); setCopied(true); setCopyError(''); }
    catch { setCopyError('Copiez directement le code ci-dessous.'); }
  }
  return <main className={s.page}>
    <header className={s.header}><Link href="/">EVENTHEME <span>↗ Retour au site</span></Link><span>BIBLIOTHÈQUE DE COMPOSANTS / 01</span></header>
    <section className={s.intro}><span className={s.eyebrow}>L’INTERFACE EVENTHEME</span><h1>Les listes déroulantes.<br /><em>Une même signature.</em></h1><p>Des composants personnalisés, réutilisables dans les formulaires du site et de l’administration. Essayez-les à la souris, au toucher ou au clavier.</p><div className={s.tags}><span>React + TypeScript</span><span>CSS Modules</span><span>Navigation clavier</span></div></section>
    <div className={s.grid}>
      <section className={s.card}><div className={s.cardTitle}><span>01</span><h2>Sélection simple</h2><code>Select</code></div><p>Une valeur, un libellé, une description. Le champ s’intègre à un formulaire standard.</p><form onSubmit={submit}>
        <Select label="Type d’événement" name="eventType" options={events} value={event} onChange={setEvent} required hint="Choisissez un événement, puis validez le formulaire." />
        <div className={s.actions}><Button type="submit" size="sm">Valider la sélection</Button><Button type="button" variant="link" size="sm" onClick={() => { setEvent(''); setResult('Sélection réinitialisée.'); }}>Réinitialiser</Button></div>
      </form><output className={s.result} aria-live="polite">{result}</output></section>
      <section className={s.card}><div className={s.cardTitle}><span>02</span><h2>Avec recherche</h2><code>searchable</code></div><p>Filtrez les libellés et leurs descriptions. La recherche ignore les accents et la casse.</p>
        <Select label="Rechercher du matériel" options={equipment} value={item} onChange={setItem} searchable placeholder="Choisir un matériel…" emptyText="Aucun matériel ne correspond à votre recherche." hint="Essayez « eclairage », « dorée » ou « technique »." />
        <output className={s.result} aria-live="polite">{item ? `Valeur sélectionnée : ${item}` : 'Aucun matériel sélectionné.'}</output>
      </section>
      <section className={s.card}><div className={s.cardTitle}><span>03</span><h2>Menu d’actions</h2><code>Dropdown</code></div><p>Déclenchez une action ou ouvrez une page depuis le même menu.</p>
        <Dropdown trigger="Gérer mon événement" label="Actions disponibles" variant="outline" items={[
          { id: 'edit', label: 'Modifier le projet', description: 'Une action de démonstration.', onSelect: () => setAction('Action déclenchée : modifier le projet.') },
          { id: 'duplicate', label: 'Dupliquer le projet', onSelect: () => setAction('Action déclenchée : dupliquer le projet.') },
          { id: 'catalog', label: 'Voir le catalogue', href: '/location', meta: '↗' },
          { id: 'archive', label: 'Archiver le projet', description: 'Indisponible pour cet exemple.', disabled: true },
        ]} />
        <output className={s.result} aria-live="polite">{action}</output>
      </section>
      <section className={s.card}><div className={s.cardTitle}><span>04</span><h2>États du composant</h2><code>Props</code></div><p>Les mêmes styles pour les erreurs, les champs désactivés et les listes en attente.</p><div className={s.states}>
        <Select label="Champ désactivé" name="disabledExample" options={events} value="mariage" onChange={() => {}} disabled required />
        <Select label="Champ avec erreur" options={events} value={errorEvent} onChange={setErrorEvent} error={!errorEvent ? 'Exemple : ce champ doit être renseigné.' : undefined} />
        <Select label="Chargement" options={[]} value="" onChange={() => {}} loading />
        <Select label="Liste vide" options={[]} value="" onChange={() => {}} emptyText="Aucune option pour le moment." />
      </div></section>
    </div>
    <section className={s.usage}><div><span className={s.eyebrow}>PRÊT À RÉUTILISER</span><h2>Un composant.<br />Tous vos formulaires.</h2><p>↑ ↓ pour parcourir · Entrée pour choisir<br />Échap pour annuler · Tab pour poursuivre</p><p>Les changements de cette page sont des exemples et ne modifient pas les contenus du site.</p></div><div className={s.code}><div><span>Exemple React</span><Button variant="link" size="sm" onClick={copy}>{copied ? 'Copié ✓' : 'Copier'}</Button></div><pre><code>{example}</code></pre>{copyError && <p role="status">{copyError}</p>}</div></section>
  </main>;
}
