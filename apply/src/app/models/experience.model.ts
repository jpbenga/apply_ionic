import { Timestamp } from '@angular/fire/firestore'; // Importer Timestamp

export interface Experience {
  id?: string;
  userId: string;
  poste: string;
  entreprise: string;
  lieu?: string;
  dateDebut: Timestamp | Date | string; // Accepte Date/string en entrée, devient Timestamp en BDD
  dateFin?: Timestamp | Date | string | null; // Accepte Date/string/null en entrée, devient Timestamp/null en BDD
  description?: string;
  enCours?: boolean;
}