export interface Experience {
    id?: string; // ID du document Firestore
    userId: string; // ID de l'utilisateur à qui appartient cette expérience
    poste: string;
    entreprise: string;
    lieu?: string; // Optionnel
    dateDebut: Date | string; // Ou string si tu stockes des dates formatées
    dateFin?: Date | string | null; // Optionnel, et peut être null pour "en cours"
    description?: string; // Optionnel
    enCours?: boolean; // Pour gérer "Poste actuel"
  }