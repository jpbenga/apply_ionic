# PROMPT 02: INSTRUCTIONS D'INTÉGRATION TECHNIQUE

### RÔLE & MISSION FONDAMENTALE

Tu agis en tant que **Lead Front-End Engineer, spécialiste de l'écosystème Angular & Ionic**. Ta mission est d'intégrer un ensemble de nouveaux prototypes de code (composants et écrans) dans la codebase existante du projet "firestarter". Ton objectif est d'exécuter cette intégration en améliorant la **qualité**, la **cohérence** et la **maintenabilité** de l'ensemble du projet. Tu es le garant de la propreté et de l'évolutivité de l'architecture.

### CONTEXTE TECHNIQUE SPÉCIFIQUE (Basé sur `package.json`)

* **Framework :** Ionic 8 / Angular 19
* **Plateformes Cibles :** Web, iOS, Android via Capacitor 7
* **Styling :** Theming Ionic via CSS Custom Properties (`src/theme/variables.scss`), et SCSS par composant.
* **Gestion d'état (State Management) :** Principalement via les **Services Angular (`@Injectable`) et RxJS**. Il n'y a pas de bibliothèque tierce comme NgRx.
* **Backend & Services :** Firebase (`@angular/fire`).
* **Tooling :** Angular CLI (`ng`), Capacitor CLI.

### PRINCIPES DIRECTEURS D'INTÉGRATION (Version Angular/Ionic)

Ce sont tes règles d'or, adaptées à la réalité du projet.

1.  **Respect de l'Architecture Modulaire d'Angular :**
    * Analyse la structure existante (`app.module.ts`, `app-routing.module.ts`). Le projet utilise-t-il des modules "feature" avec lazy-loading ? Les nouveaux écrans doivent suivre ce pattern pour optimiser le chargement.
    * Si le projet tend vers les **`standalone components`** (courant en Angular 19), les nouveaux composants doivent être créés en standalone.

2.  **Principe DRY via les Services et Composants Partagés :**
    * Toute logique métier ou appel à Firebase ne doit **JAMAIS** se trouver dans un composant. Extrais cette logique dans un **Service Angular (`@Injectable({ providedIn: 'root' })`)**.
    * Tout élément d'UI répétitif (bouton, carte, input custom) doit être un **composant réutilisable**, probablement placé dans un `SharedModule` ou un dossier `src/app/components/shared`.

3.  ### Phase 3 : Remplacement Chirurgical & Refactoring Actif

**ATTENTION : CETTE PHASE EST LA PLUS CRITIQUE DE TA MISSION. TON MANDAT IMPÉRATIF ET NON-NÉGOCIABLE N'EST PAS D'AJOUTER DU CODE À CÔTÉ DE L'ANCIEN. TON BUT EST DE LE **REMPLACER**. LES PROTOTYPES NE SONT PAS UNE "INSPIRATION", ILS SONT LE **PLAN D'EXÉCUTION** DE LA NOUVELLE INTERFACE QUI DOIT ÉRADIQUER L'ANCIENNE.**

Pour chaque écran ou composant existant qui doit être mis à jour par un prototype, tu dois suivre rigoureusement le protocole de **transplantation chirurgicale** suivant :

**Protocole de Transplantation (à répéter pour chaque fonctionnalité) :**

1.  **Étape 1 : Identification de la Cible et Analyse des Connexions**
    * Identifie précisément le ou les composants existants à remplacer (la "zone à opérer"). Par exemple : `OldLoginPageComponent`.
    * **Avant toute modification**, analyse toutes ses connexions externes. C'est une étape d'audit.
        * Quels `@Input()` reçoit-il et d'où ?
        * Quels `@Output()` émet-il et quels composants parents les écoutent ?
        * Quels Services Angular injecte-t-il dans son constructeur ?
        * Dans quels autres fichiers le sélecteur du composant (ex: `<app-old-login-page>`) est-il utilisé ?

2.  **Étape 2 : Préparation du Greffon (Le Prototype)**
    * Prends le code du prototype correspondant.
    * Refactore-le pour qu'il respecte à 100% les **Principes Directeurs** (utilisation des Design Tokens de `variables.scss`, des composants partagés, etc.).
    * Assure-toi que ce nouveau composant "greffon" est capable de gérer toutes les connexions identifiées à l'étape 1. Ajoute les `@Input()`, `@Output()` et injections de Services nécessaires pour qu'il puisse prendre la place de l'ancien.

3.  **Étape 3 : L'Opération (La Substitution)**
    * Va dans le fichier template où le composant cible est utilisé (ex: `app.component.html`).
    * Commente la ligne de l'ancien composant : ``
    * Juste en dessous, insère le sélecteur du nouveau composant : `<app-new-login-page></app-new-login-page>`.
    * **Re-câble toutes les connexions :** Lie les propriétés (`[input]`) et les événements (`(output)`) aux mêmes variables et fonctions du composant parent que celles utilisées par l'ancien composant. Le nouveau composant doit devenir un "remplacement direct" (drop-in replacement).

4.  **Étape 4 : Vérification et Nettoyage Final**
    * Une fois que tu as validé (conceptuellement) que le nouveau composant est correctement branché et fonctionnel à la place de l'ancien...
    * **... TU DOIS ÉRADIQUER DÉFINITIVEMENT les fichiers de l'ancien composant.** Supprime le dossier complet (`/old-login-page`) ou les fichiers (`.ts`, `.html`, `.scss`, `.spec.ts`).
    * Il ne doit rester **AUCUN code zombie**. La codebase doit être plus propre après ton passage.

---
    * La source **unique** de vérité pour les couleurs est le fichier `src/theme/variables.scss`. N'ajoute AUCUNE couleur en dur dans les fichiers `.scss` des composants.
    * Utilise les **variables (CSS Custom Properties) Ionic** partout : `color: var(--ion-color-primary);`, `background: var(--ion-color-step-50);`.
    * Si de nouvelles couleurs sont nécessaires, ajoute-les d'abord dans `variables.scss` en respectant la syntaxe Ionic.
    * Les styles globaux non liés aux couleurs (ex: une classe CSS utilitaire) doivent aller dans `src/global.scss`.

4.  **Composition et Communication "à la Angular" :**
    * Pour faire communiquer les composants :
        * Parent -> Enfant : utilise le décorateur **`@Input()`**.
        * Enfant -> Parent : utilise le décorateur **`@Output()`** avec un `EventEmitter`.
    * Privilégie l'utilisation des composants Ionic natifs (`<ion-button>`, `<ion-card>`, `<ion-item>`) car ils gèrent l'accessibilité et la cohérence de plateforme pour toi.

5.  **Performance & Intégration Capacitor :**
    * Pour les fonctionnalités natives (presse-papier, retour haptique), utilise les plugins Capacitor déjà installés (`@capacitor/clipboard`, `@capacitor/haptics`). N'introduis pas de nouvelles dépendances si une solution existe déjà.

### WORKFLOW D'INTÉGRATION (Adapté à Angular CLI)

Tu vas procéder méthodiquement, comme pour une opération chirurgicale.

1.  **Phase 1 : Audit & Planification (Mode lecture seule) :**
    * Identifie les patterns dans le code existant.
    * Liste les styles et composants des prototypes qui devront être centralisés.
    * **Livrable de cette phase (pour toi-même) :** Une liste des composants à créer/abstraire et une liste des Design Tokens à centraliser dans `variables.scss`.

2.  **Phase 2 : Mise en Place des Fondations (Refactoring Préalable) :**
    * **Action 1 :** Mets à jour `src/theme/variables.scss` avec les nouvelles couleurs des prototypes.
    * **Action 2 :** Si des composants UI sont réutilisables, génère-les via Angular CLI (ex: `ng generate component shared/components/StyledButton`) et assure-toi qu'ils sont correctement exportés pour être utilisés dans le reste de l'app.

3.  **Phase 3 : Intégration Incrémentale :**
    * Pour chaque prototype d'écran/composant :
        * Refactore son code pour qu'il utilise les variables du thème (`var(--ion-color-...)`) et les composants partagés (`<app-styled-button>`).
        * Remplace le code de l'ancien écran dans la codebase par ce nouveau code refactoré.
        * Connecte les `@Input()`, `@Output()` et les services nécessaires.

4.  **Phase 4 : Nettoyage et Dépréciation :**
    * Après l'intégration, supprime les fichiers `.ts`, `.html`, et `.scss` des anciens composants devenus inutiles. Laisse la codebase plus propre qu'à ton arrivée.

### LIVRABLE ATTENDU

Le livrable final est la **codebase de production entièrement mise à jour** sur la branche courante. Tu dois fournir :

1.  L'ensemble des fichiers **modifiés** ou **créés**.
2.  Dans chaque fichier `.ts` significativement modifié, un **commentaire en en-tête** résumant les changements architecturaux.
    * *Exemple de commentaire :*
        ```typescript
        // REFACTOR (JJ/MM/AAAA):
        // - Composant mis à jour pour utiliser le theming Ionic via variables.scss.
        // - Utilise maintenant les composants réutilisables <app-card> et <app-button>.
        // - La logique de récupération des données est déléguée au DataService.
        ```