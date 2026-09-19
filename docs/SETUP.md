# Eventheme — installation et administration

## Aperçu local

`npm install`, puis `npm run dev -- --hostname 127.0.0.1`.

Ouvrir http://localhost:3000. L’administration n’a aucun accès sans compte, y compris en local : toute page `/admin` renvoie vers `/admin/connexion`, et seul un compte Supabase Auth portant le rôle administrateur peut s’y connecter (voir « Comptes administrateur »). Renseigner au minimum `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dans `.env.local` ; sans eux, la page de connexion indique que l’administration n’est pas configurée. Ne pas saisir de vraies coordonnées clients en développement.

Sans `EVENTHEME_DATA_MODE=supabase`, le développement utilise `.eventheme/data.json` pour le contenu et les demandes ; la connexion passe quand même par Supabase Auth. Les modifications et demandes survivent au redémarrage. Ce dossier est exclu de Git. Les photos importées sont dans `public/uploads/`, également exclu de Git. Sauvegarder ces deux dossiers pour conserver la démonstration. Aucun e-mail automatique n’est envoyé.

En production (`npm run build && npm start`), les données locales et leurs écritures sont désactivées. Il faut configurer Supabase pour recevoir de vraies demandes.

## Gestion du site

- **Services** : ajouter, modifier, publier/dépublier ou supprimer ; renseigner le tarif.
- **Matériel & variantes** : catégorie/type, description, photos, caractéristiques, couleur, longueur et largeur en cm (facultatives), disponibilité indicative, variantes et prix. Une variante remplace le prix principal, elle ne s’y ajoute pas.
- **Types d’événement** : options du configurateur et frais fixes additionnels.
- **Réalisations** : nom, catégorie, lieu, date, description, photo, galerie, lien vidéo. Retirer le marquage de démonstration seulement après remplacement par un véritable projet autorisé.
- **Contenu des pages** : les identifiants stables sont `home`, `about`, `values`, `contact`, `events-page`, `services-page`, `location-page`, `projects-page`. Ajouter `legal` et `privacy` avec les textes validés. Le champ titre accepte les retours à la ligne.
- **Contact & réseaux** : liens https, mailto, tel. Garder `whatsapp` et `instagram` pour les liens de marque existants.
- **Demandes / messages / clients** : coordonnées, sélection, résumé des prix au moment de l’envoi, statut, notes internes, export CSV et suppression de la demande.

Un prix vide ou le mode « Sur demande » est un montant à chiffrer. Le mode « À partir de » reste indicatif. La durée de location est le nombre de jours entre départ et retour, avec un minimum d’un jour. La disponibilité est une indication manuelle, sans réservation ni suivi de stock automatique. Les montants ne constituent jamais un devis contractuel et n’incluent aucune règle fiscale ou de livraison implicite.

## Préparer la production Supabase

1. Créer un projet Supabase dédié à Eventheme. Exécuter, dans l’ordre de leur nom, les fichiers SQL de `supabase/migrations/` dans son SQL Editor, ou les déployer avec le CLI après vérification du projet cible. Ils créent les tables, politiques RLS, limitation des tentatives et bucket média.
2. Exécuter `npm run content:export`. Le fichier `supabase/seed.sql` contient uniquement les contenus publics, jamais les demandes clients. L’exécuter dans le projet pour initialiser le catalogue. Les identifiants déjà présents ne sont pas écrasés.
3. Copier `.env.example` en `.env.local` pour un test connecté et définir `EVENTHEME_DATA_MODE=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, ainsi que `APP_URL` avec l’origine exacte du site. En hébergement, configurer ces valeurs dans les variables serveur. La clé secrète ne doit jamais utiliser le préfixe `NEXT_PUBLIC_`.
4. Créer le ou les comptes administrateur (voir « Comptes administrateur » ci-dessous).
5. Tester la connexion et la déconnexion, chaque opération CRUD, un formulaire public, les accès anonymes refusés à `inquiries`, et le refus d’un compte authentifié sans rôle administrateur. Le serveur revalide l’utilisateur pour chaque opération admin.
6. Les photos locales `/uploads/…` ne sont pas transférées par l’export SQL. Les importer dans Supabase Storage et mettre à jour leurs URL avant le déploiement. Les médias publics sont accessibles à tous : ne jamais y déposer de documents clients privés.

Les cookies administrateur sont rafraîchis par `src/proxy.ts`. Les demandes publiques passent uniquement par le serveur, qui valide les champs, recalcule les tarifs, vérifie l’origine et limite les tentatives. La clé secrète est utilisée seulement côté serveur. Ne pas mettre en cache les routes admin/API au niveau du CDN. Ajouter une limitation du trafic par IP au niveau de l’hébergement pour compléter la limitation applicative par e-mail.

Références : [clients SSR Supabase](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Comptes administrateur

Seuls les comptes Supabase Auth dont `app_metadata.role` vaut `"admin"` ouvrent l’administration. Ce champ ne peut être écrit qu’avec la clé secrète ; `user_metadata`, modifiable par l’utilisateur, n’est jamais pris en compte.

1. Dans le tableau de bord Supabase, **Authentication → Sign In / Providers** : désactiver « Allow new users to sign up ». Un compte créé autrement n’aurait de toute façon pas le rôle administrateur.
2. **Authentication → Users → Add user → Create new user** : saisir l’e-mail et un mot de passe robuste, cocher « Auto Confirm User ». Le mot de passe ne passe ainsi ni par le terminal ni par Git.
3. Avec `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SECRET_KEY` dans `.env.local`, attribuer le rôle : `npm run admin:role -- grant email@exemple.ma`.
4. Se connecter sur `/admin/connexion`. Si la session était déjà ouverte avant l’attribution du rôle, se déconnecter puis se reconnecter.

Pour retirer l’accès : `npm run admin:role -- revoke email@exemple.ma`, ou supprimer l’utilisateur dans Supabase. Les pages et les API admin interrogent le serveur Auth à chaque requête (`getUser()`), donc le refus est immédiat.

Protection en place : `src/proxy.ts` redirige toute page `/admin` vers `/admin/connexion` et répond 401 sur `/api/admin` sans session administrateur. La page `/admin` et chaque route API revérifient ensuite le compte côté serveur. La connexion est limitée à cinq tentatives par e-mail et par quart d’heure, et un compte sans rôle administrateur est déconnecté avec le même message qu’un mauvais mot de passe.

## À terminer avant ouverture au public

- Remplacer les photos d’illustration et les exemples de catalogue par les médias et offres réels ; renseigner les tarifs et coordonnées approuvés.
- Compléter et valider les mentions légales et la politique de confidentialité. Il n’y a pas de paiement ni d’analytics intégrés.
- Choisir et connecter un fournisseur d’e-mails pour les notifications administrateur et accusés de réception. Le site enregistre les demandes mais ne prétend pas envoyer d’e-mails.
- Configurer domaine, HTTPS, sauvegardes et règles de conservation des données ; tester Supabase RLS et Storage sur le projet réel. La migration est fournie mais n’est pas appliquée automatiquement.
- `/bientot` est disponible comme page d’attente. Elle n’est pas imposée à la place du site de démonstration.
- `APP_URL` alimente le sitemap. Vérifier l’URL avant l’indexation, puis connecter Search Console si souhaité.

## Vérifications

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

Les tests de fumée se connectent avec un vrai compte administrateur : définir `EVENTHEME_ADMIN_EMAIL` et `EVENTHEME_ADMIN_PASSWORD` dans l’environnement ou dans `.env.local` (jamais dans `.env.example`). Avec l’aperçu local actif sur le port 3000, `node tests/api-smoke.mjs` vérifie la redirection de `/admin`, les refus d’accès, le CRUD, les demandes et le recalcul serveur. Il supprime uniquement ses propres données temporaires. Pour vérifier les imports d’images et la fermeture du mode démo en production, lancer aussi `npm start -- --hostname 127.0.0.1 --port 3001`, puis `node tests/deployment-smoke.mjs`. Ces tests refusent de fonctionner en mode Supabase.

Les tests couvrent les calculs de prix, variantes non chiffrées, durées, validations des formulaires et contenus. Le navigateur permet de tester le parcours catalogue → devis → boîte de réception, ainsi que les formats bureau et mobile. La configuration Supabase et l’envoi d’e-mails nécessitent une vérification réelle après connexion aux services choisis.
