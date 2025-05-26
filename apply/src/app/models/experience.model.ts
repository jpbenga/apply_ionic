export interface Experience {
  id?: string; 
  userId: string; 
  poste: string;
  entreprise: string;
  lieu?: string; 
  dateDebut: Date | string; 
  dateFin?: Date | string | null; 
  description?: string; 
  enCours?: boolean; 
}