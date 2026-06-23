# MACIN Admin

Application web légère (Express + EJS) pour gérer tes formations, formateurs
et badges sans repasser par la console Firebase ou des scripts à la main.

## Architecture

```
macin-admin/
├── server.js                      Point d'entrée
├── src/
│   ├── config/
│   │   ├── firebase.js            Init Firebase Admin (singleton)
│   │   └── r2.js                  Client Cloudflare R2 (S3-compatible)
│   ├── middlewares/
│   │   ├── auth.js                Protection des routes (session)
│   │   └── upload.js              Multer (upload en mémoire)
│   ├── services/                  Logique métier, indépendante d'Express
│   │   ├── courseService.js       Cours / modules / leçons (Firestore)
│   │   ├── instructorService.js   Formateurs (Firestore, collection users)
│   │   ├── badgeService.js        Badges (Firestore)
│   │   └── r2Service.js           Upload/suppression de fichiers R2
│   ├── controllers/                Reçoivent req/res, appellent les services
│   ├── routes/                     Définition des endpoints, par domaine
│   └── views/
│       ├── layouts/main.ejs        Layout commun (sidebar + topbar)
│       ├── partials/                ⭐ WIDGETS RÉUTILISABLES
│       │   ├── sidebar.ejs
│       │   ├── topbar.ejs
│       │   ├── flash.ejs            Messages succès/erreur
│       │   ├── stat-card.ejs        Carte de statistique (dashboard)
│       │   ├── course-card.ejs      Carte de formation
│       │   ├── delete-button.ejs    Bouton supprimer + confirmation
│       │   └── empty-state.ejs      État "liste vide"
│       ├── dashboard/, courses/, instructors/, badges/, auth/, errors/
└── public/
    ├── css/style.css               Design system (variables CSS, composants)
    └── js/main.js
```

**Pourquoi cette architecture ?**
- `services/` ne connaît rien d'Express — tu pourrais les réutiliser dans un
  script CLI ou une API REST plus tard sans rien changer.
- `controllers/` ne contiennent aucune logique métier, juste de l'orchestration.
- `views/partials/` = tes composants UI réutilisables, comme des "widgets"
  Flutter : un seul fichier `course-card.ejs`, utilisé partout où une carte
  de formation doit s'afficher (dashboard, liste, recherche future...).

## Installation

```bash
npm install
cp .env.example .env
```

Remplis `.env` :
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` : tes identifiants de connexion au panel
- `SESSION_SECRET` : une chaîne aléatoire longue
- Variables `R2_*` : identiques à celles de tes scripts précédents
- `FIREBASE_SERVICE_ACCOUNT_PATH` : laisse `./serviceAccountKey.json` et
  place le fichier téléchargé depuis la console Firebase à la racine du
  projet (Paramètres du projet -> Comptes de service -> Générer une nouvelle
  clé privée).

## Lancer le serveur

```bash
npm start
```

Puis ouvre `http://localhost:3000`, connecte-toi avec `ADMIN_EMAIL` /
`ADMIN_PASSWORD`.

En développement, `npm run dev` relance le serveur automatiquement à chaque
modification de fichier (Node 18+).

## Ce que tu peux faire avec

- **Formations** : créer, éditer, supprimer, publier/dépublier, uploader la
  miniature directement depuis le formulaire (envoyée vers R2 automatiquement)
- **Modules & leçons** : ajoutés directement depuis la page détail d'une
  formation, avec upload de la vidéo/PDF en un clic (plus besoin de scripts)
- **Formateurs** : créer une fiche formateur (liée à un UID Firebase Auth
  existant si tu en as un, ou autonome sinon), avec photo
- **Badges** : créer/supprimer avec icône

Toutes les écritures Firestore utilisent `merge: true` — rien n'écrase tes
données existantes par erreur.

## Limite actuelle de l'authentification

L'authentification du panel est volontairement simple : un seul compte admin
défini dans `.env`. C'est suffisant pour un usage solo. Si tu veux plus tard
plusieurs admins ou une vraie connexion Firebase Auth, dis-le moi — on
adaptera `authController.js` et `middlewares/auth.js` sans toucher au reste
de l'app (c'est tout l'intérêt de l'architecture en couches).

## Et les scripts `macin-admin` (CLI) ?

Les scripts qu'on a faits avant (`create_course.js`, `upload_media_r2.js`...)
restent utiles pour des imports en masse (ex: importer 50 leçons d'un coup
depuis un fichier JSON). Ce panel web, lui, est fait pour la gestion au
quotidien : ajouter une leçon, corriger un titre, publier un cours — sans
toucher à un terminal.
