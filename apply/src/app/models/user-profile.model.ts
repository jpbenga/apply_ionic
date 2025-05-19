// src/app/models/user-profile.model.ts
export interface UserProfile {
    id?: string;
    userId: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    cvBase?: string; // URL du CV de base stocké
    competences?: string[];
    experiences?: Experience[];
    formations?: Formation[];
  }
  
  export interface Experience {
    entreprise: string;
    poste: string;
    debut: Date;
    fin?: Date;
    description: string;
  }
  
  export interface Formation {
    etablissement: string;
    diplome: string;
    annee: number;
    description?: string;
  }