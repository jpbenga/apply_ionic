import { Timestamp } from '@angular/fire/firestore';

export interface Formation {
  id?: string; // ID du document Firestore
  userId: string; // ID de l'utilisateur
  diplome: string; // Ex: Master, Licence, BTS, Titre Professionnel
  etablissement: string; // Ex: Université Lyon 1, OpenClassrooms
  ville?: string;
  dateDebut: Timestamp | Date | string;
  dateFin?: Timestamp | Date | string | null;
  enCours?: boolean;
  description?: string; // Détails, matières principales, mention, etc.
}