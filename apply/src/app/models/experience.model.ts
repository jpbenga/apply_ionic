import { Timestamp } from '@angular/fire/firestore';

export interface Experience {
  id?: string;
  userId: string;
  poste: string;
  entreprise: string;
  lieu?: string;
  dateDebut: Timestamp | Date | string;
  dateFin?: Timestamp | Date | string | null;
  // MODIFIÉ : Accepte maintenant une liste de missions
  description?: string[] | string;
  enCours?: boolean;
}