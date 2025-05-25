// src/app/models/user-profile.model.ts
export interface UserProfile {
    id?: string;
    userId: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    cvBase?: string;
    titrePoste?: string;
    resumePersonnel?: string;
    competences?: string[];
    experiences?: Experience[];
    formations?: Formation[];
    photoURL?: string;
    createdAt?: any;
    updatedAt?: any;
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