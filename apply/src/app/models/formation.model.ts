import { Timestamp } from '@angular/fire/firestore';

export interface Formation {
  id?: string;
  userId: string;
  diplome: string;
  etablissement: string;
  ville?: string;
  dateDebut: Timestamp | Date | string;
  dateFin?: Timestamp | Date | string | null;
  enCours?: boolean;
  // MODIFIÉ : Accepte maintenant une liste pour les détails
  description?: string[] | string;
}