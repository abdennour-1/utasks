# UTasks

Un clone simplifié de Trello : une application front-end Vue 3 qui consomme l'[API UTasks](https://utasks-026af75f15a3.herokuapp.com/docs/) existante.

Ce dépôt correspond au livrable 1. Tout le code se trouve dans `frontend/` ; le livrable 2 ajoutera `backend/`.

## Démarrage

**Prérequis :** Node.js 22.18+ ou 24.12+ (testé avec la 24.21) et npm, ainsi que Google Chrome.

```bash
cd frontend
npm install
npm run dev
```

Ouvrez ensuite **http://localhost:5173**.

Le premier appel à l'API peut prendre plusieurs secondes si le serveur Heroku est en veille.

Pour tester sur un vrai téléphone ou une vraie tablette connectés au même réseau, lancez `npm run dev -- --host` et ouvrez l'URL « Network » affichée.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Vérifie les types et compile pour la production |
| `npm run preview` | Sert le build de production |
| `npm run lint` | Lance oxlint et ESLint |
| `npm run format` | Formate le code avec Prettier |

## Comment tester chaque fonctionnalité

L'interface est en anglais : les libellés en gras ci-dessous sont ceux affichés à l'écran.

Pour tester l'iPad et l'iPhone dans Chrome, ouvrez DevTools (F12) et activez la barre d'appareils (Ctrl+Shift+M). **Rechargez la page après chaque changement d'appareil** pour que le tactile soit détecté.

| # | Fonctionnalité | Points | Comment tester |
| --- | --- | --- | --- |
| 1 | Créer un usager | /3 | Cliquez sur **Create one** et choisissez un nom d'usager. L'écran suivant affiche votre user ID. Un nom déjà pris affiche une erreur sous le champ. |
| 2 | Se connecter | | Cliquez sur **Log out**, puis connectez-vous avec le nom d'usager (sans tenir compte de la casse). La session survit à un rechargement. Ouvrir `/boards` sans être connecté redirige vers la page de connexion. Pour une connexion depuis un autre navigateur, voir [Limites connues](#limites-connues). |
| 3 | Créer des boards | /5 | Sur **My boards**, cliquez sur **Create a board** ou **New board**. Les boards s'affichent en grille. |
| 4 | Créer une liste | /5 | Ouvrez un board et cliquez sur **Add a list**. |
| 5 | Créer une carte | /5 | Dans une liste, cliquez sur **Add a card**. L'API exige tous les champs. Choisissez une date passée pour voir la mise en évidence des cartes en retard. |
| 6 | Visualiser les boards, listes et cartes | /3 | Le board affiche ses listes en colonnes avec un défilement horizontal. Sur iPhone, les colonnes se calent en place lors du balayage. |
| 7 | Modifier | /5 | Cliquez sur le titre d'un board ou d'une liste pour le renommer (Entrée enregistre, Échap annule). Sur **My boards**, l'icône crayon permet de modifier un board et sa description. Cliquez sur une carte pour ouvrir son détail. |
| 8 | Supprimer | /3 | Utilisez les icônes de corbeille des boards et des listes, et **Delete** dans le détail d'une carte. Chaque suppression demande une confirmation. |
| 9 | Glisser les cartes d'une liste à l'autre | /20 | Glissez une carte vers une autre liste, même vide, puis rechargez : le changement est conservé. **Au toucher, maintenez la carte un court instant avant de la déplacer** ; un balayage rapide fait défiler la page. Glissez près du bord de l'écran pour atteindre la colonne suivante. |
| 10 | Réordonner les listes | /20 | Glissez une liste par sa **poignée à points**, à gauche du titre, par exemple pour échanger les listes 1 et 3. Rechargez : l'ordre est conservé. |
| 11 | Trier les cartes | /15 | Utilisez le sélecteur **Sort** d'une liste : Manual, Priority, Due date ou Priority then due date. Le bouton voisin inverse le sens. Chaque liste a son propre tri. Tant qu'un tri est actif, les cartes ne peuvent pas être réordonnées dans la liste, mais peuvent toujours aller vers une autre liste. |
| 12 | Gestion d'erreur | /8 | Voir ci-dessous. |

**Tester la gestion d'erreur (12) :**

- **Validation :** envoyez un formulaire vide ou trop long. Par exemple, la description d'une carte est limitée à 30 caractères.
- **Hors ligne :** dans DevTools, réglez Network sur **Offline**. Un bandeau apparaît et les actions qui échouent affichent un toast. Une carte déplacée revient dans sa liste d'origine.
- **Erreurs serveur :** dans le panneau Network de DevTools, bloquez une requête ou remplacez sa réponse par une erreur 500. Les erreurs de chargement affichent un bouton **Try again**.
- **Page introuvable :** ouvrez `/boards/unknown` ou `/nope`.
- **États de chargement et états vides :** ralentissez le réseau pour voir les skeletons, et utilisez un nouveau compte pour voir « No boards yet ».

## Choix techniques

- **Stack :** Vue 3 avec `<script setup>`, TypeScript, Vite, vue-router, Pinia et axios.
- **Drag and drop :** `vuedraggable@next` (SortableJS), qui gère le tactile.
- **`src/api/` :** un fichier par ressource, plus `client.ts`, l'instance axios partagée. Son intercepteur transforme chaque échec en `ApiError` avec un message en anglais.
- **`src/stores/` :** seuls appelants de la couche API pour les boards, les listes et les cartes. Les composants appellent les actions des stores.
- **Déplacements optimistes :** une carte glissée se déplace immédiatement. Si l'API refuse, seule cette carte revient en arrière et un toast explique pourquoi. Une carte en cours d'enregistrement ne peut pas être glissée de nouveau, ce qui évite les mises à jour simultanées.
- **Tri :** une fonction pure (`utils/cardSort.ts`) calcule l'ordre affiché ; l'ordre manuel est donc conservé et restauré au retour sur Manual. Dans « Priority then due date », le sens s'applique à la priorité, et à priorité égale la date d'échéance la plus proche passe toujours en premier.
- **Limites des formulaires :** l'API renvoie une erreur 500 pour certaines valeurs trop longues, donc les formulaires les vérifient avant l'envoi. Les limites observées sont dans [docs/API_NOTES.md](docs/API_NOTES.md).

## Limites connues

Elles découlent toutes de ce que l'API propose. Les détails sont dans [docs/API_NOTES.md](docs/API_NOTES.md).

- **La connexion depuis un autre navigateur ou appareil demande le user ID.** L'API n'a ni endpoint de connexion, ni recherche par nom d'usager, ni moyen de lister les usagers. Les comptes sont donc mémorisés dans le `localStorage` du navigateur à leur création ou à leur première utilisation. Si le nom d'usager n'y est pas connu, le formulaire demande une fois le user ID affiché après l'inscription. Ensuite, le nom d'usager suffit sur ce navigateur.
- **L'ordre des listes est stocké localement.** L'API n'a pas de champ `position` ou `order` ; l'ordre est donc conservé dans le `localStorage`, par board. Il en va de même pour l'ordre manuel des cartes dans une liste et pour le tri choisi sur chaque liste. Ces réglages ne suivent pas l'usager sur un autre navigateur. En revanche, le déplacement d'une carte vers une autre liste est bien enregistré par l'API.
- **Aucune vraie sécurité.** L'API n'a pas d'authentification et ne vérifie pas la propriété des données. Le guard de routes et le filtre « mes boards » existent uniquement côté client.
- **Tous les champs d'une carte sont exigés par l'API.** La description (1 à 30 caractères), la priorité et la date d'échéance sont obligatoires ; il n'y a donc pas de création rapide avec le titre seul.
- **Erreurs réseau dans la console.** L'application n'écrit rien elle-même dans la console et gère chaque appel en échec, mais Chrome affiche toujours une ligne « Failed to load resource » pour une requête en erreur. Elle peut apparaître pour une erreur attendue, comme un nom d'usager déjà pris.
- **Le drag and drop n'a pas d'alternative au clavier.**
