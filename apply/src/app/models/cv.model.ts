import { Timestamp } from '@angular/fire/firestore';

export interface Cv {
  id?: string;
  userId: string;
  nom: string;
  fichierUrl: string;
  texteExtrait: string;
  dateCreation: Timestamp;
  dateModification: Timestamp;
  tailleFichier?: number;
  typeFichier: 'pdf' | 'docx';
}