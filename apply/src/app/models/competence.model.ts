export interface Competence {
    id?: string; // ID du document Firestore
    userId: string; // ID de l'utilisateur
    nom: string; // Ex: JavaScript, Gestion de projet, Anglais
    categorie?: string; // Optionnel: Ex: Langages de programmation, Outils, Langues
    // niveau?: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'; // Optionnel pour plus tard
  }