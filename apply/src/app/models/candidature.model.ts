// src/app/models/candidature.model.ts

export interface SuiviCandidature {
  id?: string;
  date: any; // Sera un Firebase Timestamp
  type: 'email_envoye' | 'email_recu' | 'appel_effectue' | 'appel_recu' | 'entretien_planifie' | 'entretien_effectue' | 'test_technique_recu' | 'test_technique_complete' | 'relance' | 'autre';
  notes: string;
}

export interface Candidature {
  id?: string;
  userId: string;

  // Informations sur le poste et l'entreprise
  // Ces champs peuvent être remplis par l'IA ou manuellement par l'utilisateur
  poste: string;                      // Titre du poste (potentiellement extrait par l'IA ou saisi)
  entreprise: string;                 // Nom de l'entreprise (potentiellement extrait par l'IA ou saisi)
  lieu?: string;                       // Lieu du poste (optionnel)
  typeContrat?: string;                // Ex: CDI, CDD, Freelance (optionnel)
  urlOffre?: string;                   // URL de l'offre d'emploi originale (optionnel)

  // Contenu de l'offre et du CV
  offreTexteComplet: string;          // Texte complet de l'offre d'emploi
  cvOriginalNom?: string;              // Nom du fichier CV original uploadé
  cvOriginalUrl?: string;              // URL de stockage du CV original (Firebase Storage)
  cvTexteExtrait?: string;             // Texte brut extrait du CV

  // Résultats de l'IA
  analyseATS?: string;                 // Texte complet de l'analyse ATS fournie par l'IA
  lettreMotivationGeneree?: string;    // Texte de la lettre de motivation générée par l'IA
  // cvModifieTexte?: string;          // Si on ajoute une fonctionnalité de modification de CV par l'IA

  // Statut et suivi
  dateCandidature: any;               // Firebase Timestamp de la date de postulation
  statut: 'brouillon' | 'envoyee' | 'en_cours_rh' | 'entretien_planifie' | 'test_technique' | 'entretien_final' | 'offre_recue' | 'acceptee' | 'refusee_candidat' | 'refusee_entreprise' | 'archivee' | 'standby';
  sourceCandidature?: string;          // D'où vient l'offre (ex: LinkedIn, site entreprise, ApplyApp)
  notesPersonnelles?: string;          // Notes de l'utilisateur sur cette candidature
  contacts?: { nom?: string; email?: string; telephone?: string; role?: string }[]; // Contacts liés à la candidature

  suivi?: SuiviCandidature[];          // Historique des interactions

  // Timestamps
  createdAt: any;                     // Firebase Server Timestamp pour la création
  updatedAt?: any;                    // Firebase Server Timestamp pour la dernière mise à jour
}