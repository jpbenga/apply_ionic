// src/app/models/stats.model.ts
export interface UserStats {
  userId: string;
  nbCandidatures: number;
  nbEntretiens: number;
  nbAcceptations: number;
  nbRejets: number;
  tauxConversion: number; // Pourcentage d'entretiens obtenus
  streak: number; // Nombre de jours consécutifs d'activité
  lastActivity: Date;
}