**ROLE & OBJECTIF :**

Tu agis en tant que Head of Product & UX Design avec plus de 15 ans d'expérience. Ta mission est de conceptualiser et de prototyper une application mobile de bout-en-bout nommée "Apply" (ou "Postuler"). L'application a pour but de devenir le copilote de carrière intelligent pour les chercheurs d'emploi, en automatisant entièrement le processus de candidature et en accompagnant l'utilisateur tout au long de sa carrière.

---

### 1. CONCEPT STRATÉGIQUE & PROPOSITION DE VALEUR

* **Nom de l'application :** Apply (version internationale), Postuler (version française).
* **Proposition de valeur :** "Apply ne se contente pas de vous aider à postuler. Il postule pour vous, intelligemment, et devient votre agent de carrière personnel. Libérez-vous de la charge mentale de la recherche d'emploi et concentrez-vous sur la réussite de vos entretiens."
* **Cible Utilisateur (Persona principal) :** Professionnels actifs (25-45 ans) qui cherchent à évoluer mais manquent de temps pour une recherche d'emploi active et personnalisée. Ils sont à l'aise avec la technologie et cherchent à optimiser leur efficacité.
* **Modèle Mental à créer :** L'utilisateur ne doit pas percevoir l'app comme un simple "outil" mais comme un "assistant personnel proactif". Le dialogue et les notifications doivent refléter ce positionnement.
* **Facteurs Clés de Différenciation :**
    1.  **Automatisation de bout-en-bout :** Recherche, personnalisation du CV et de la lettre, et soumission de la candidature.
    2.  **Hyper-personnalisation par IA :** Analyse sémantique profonde des offres et du profil pour un matching parfait.
    3.  **Accompagnement post-candidature :** Préparation aux entretiens, suivi, aide à la négociation.

---

### 2. ARCHITECTURE DE L'INFORMATION & PARCOURS UTILISATEUR CLÉS (User Flows)

Tu vas concevoir deux phases de parcours : le MVP (Produit Minimum Viable) et la Vision Complète.

**Phase 1 : MVP - L'Assistant de Candidature Intelligent**

1.  **Onboarding (3 écrans max) :**
    * Présentation de la proposition de valeur (cf. vos écrans "Optimize your resume").
    * Importation du CV "maître" de l'utilisateur (PDF, LinkedIn).
    * Demande des objectifs de carrière principaux (poste, secteur, localisation).
2.  **Parcours Principal :**
    * **Input :** L'utilisateur colle le lien ou le texte d'une offre d'emploi (cf. votre écran "Veuillez coller l'offre").
    * **Traitement par IA (Feedback visible) :** Une animation de "scan" ou "analyse" rassure l'utilisateur.
    * **Output (Dashboard de candidature) :**
        * **Rapport d'analyse IA :** Affiche le score de compatibilité, les mots-clés manquants.
        * **CV Optimisé généré :** Met en avant les expériences les plus pertinentes.
        * **Lettre de Motivation générée :** Personnalisée avec le ton juste.
        * **CTA principal :** "Valider et envoyer la candidature" ou "Télécharger les documents".

**Phase 2 : Vision Complète - Le Copilote de Carrière Autonome**

1.  **Dashboard Central :** C'est le hub principal. Il présente :
    * Un résumé des candidatures envoyées par l'IA cette semaine.
    * Les entretiens à venir.
    * Une "opportunité de la semaine" identifiée par l'IA.
2.  **Module "Recherche Active" (paramétrage) :**
    * L'utilisateur définit des règles : "Postuler automatiquement à toutes les offres de 'Product Manager' à Lyon dans des entreprises de plus de 50 employés, avec un score de compatibilité > 85%".
    * Il peut mettre en pause ou ajuster l'agent à tout moment.
3.  **Module "Suivi des Candidatures" :**
    * Un Kanban visuel (Contacté, Entretien planifié, Offre reçue, Refusé).
4.  **Module "Préparation aux Entretiens" :**
    * Après qu'une candidature a reçu une réponse positive, l'IA génère : une fiche sur l'entreprise, des questions probables pour l'entretien, des éléments de langage pour négocier le salaire.
5.  **Module "Veille Carrière" :**
    * Analyse du marché en continu pour suggérer des compétences à acquérir et fournir des benchmarks de salaires.

---

### 3. DESIGN D'INTERACTION & PRINCIPES FONDAMENTAUX

* **Charge Cognitive Minimale :** L'interface doit être épurée. Chaque écran a un seul objectif principal. L'automatisation est la norme.
* **Feedback & Transparence :** L'utilisateur doit toujours savoir ce que l'IA fait pour lui. Utilise des notifications claires ("J'ai trouvé 3 nouvelles offres qui pourraient vous plaire.", "J'ai envoyé votre candidature pour le poste de...") et des statuts visibles.
* **Micro-interactions :** Intègre des animations subtiles pour confirmer les actions (validation, envoi, analyse). Elles doivent renforcer le sentiment d'efficacité et de modernité.
* **Design Émotionnel :** Le ton doit être rassurant, professionnel et encourageant. La recherche d'emploi est stressante ; l'application doit être une source de confiance et de soulagement.
* **Affordance :** Les boutons et zones cliquables doivent être évidents. Utilise des couleurs vives pour les actions primaires (CTA).

---

### 4. IDENTITÉ VISUELLE & DESIGN SYSTEM

Tu vas te baser sur les images fournies, qui posent d'excellentes fondations.

* **Logo :** Le logo **en haut à gauche de la première image (lettre A stylisée avec une coche de validation)** est le plus fort. Il symbolise à la fois "Apply" et le "succès/validation". C'est notre logo principal.
* **Palette de Couleurs (Design Tokens) :**
    * `primary-blue`: #4F46E5 (Le bleu/violet principal pour les actions et l'identité)
    * `accent-yellow`: #FBBF24 (Le jaune pour les CTA "Get Started" et les éléments à mettre en avant)
    * `text-dark`: #1F2937 (Le bleu très foncé pour le corps de texte)
    * `neutral-background`: #FFFFFF / #F9FAFB (Blanc et gris très clair pour les fonds)
* **Typographie :** Une police Sans-Serif moderne et très lisible (ex: Inter, Manrope, Figtree). Définis une hiérarchie claire (H1, H2, Body, Caption).
* **Iconographie :** Style "Solid" (rempli), simple et universellement compréhensible.
* **Composants :** Crée un set de composants UI réutilisables : boutons (primaire, secondaire, tertiaire), champs de texte, cartes (cards) pour les offres d'emploi, indicateurs de progression.

---

### 5. MESURE DU SUCCÈS & KPIs UX

Comment saurons-nous que le design est réussi ? L'IA doit optimiser pour les KPIs suivants :

* **Taux d'Activation :** % d'utilisateurs qui importent leur CV maître après l'inscription.
* **Taux de Génération (MVP) :** % d'utilisateurs qui génèrent au moins un combo CV/lettre.
* **Taux de Conversion (Vision Complète) :** Nombre d'entretiens décrochés / nombre de candidatures envoyées par l'IA.
* **Score d'Effort Client (CES) :** Mesuré via un micro-sondage : "Sur une échelle de 1 à 5, à quel point a-t-il été facile de postuler via Apply ?"
* **Rétention :** % d'utilisateurs qui ouvrent l'app au moins une fois par semaine.

---

**LIVRABLE ATTENDU :**

Génère une série de wireframes haute-fidélité (ou de prototypes cliquables) couvrant le parcours d'onboarding (Phase 1) et le Dashboard Central (Phase 2), en appliquant rigoureusement tous les principes ci-dessus. Justifie tes choix de design en te référant à la stratégie et aux principes d'interaction définis.