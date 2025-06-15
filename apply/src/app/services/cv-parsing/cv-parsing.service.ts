// src/app/services/cv-parsing/cv-parsing.service.ts
import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';
import { Competence } from 'src/app/models/competence.model';

export interface ParsedCvData {
  experiences: Omit<Experience, 'id' | 'userId'>[];
  formations: Omit<Formation, 'id' | 'userId'>[];
  competences: Omit<Competence, 'id' | 'userId'>[];
  personalInfo?: {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CvParsingService {

  constructor(private functions: Functions) { }

  async parseCvText(extractedText: string): Promise<ParsedCvData> {
    const prompt = this.buildStructuringPrompt(extractedText);
    
    const callOpenAi = httpsCallable(this.functions, 'callOpenAi');
    const result = await callOpenAi({ prompt });
    
    const response = result.data as any;
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de l\'analyse du CV');
    }

    // Parser la réponse JSON d'OpenAI
    try {
      const parsedData = JSON.parse(response.response);
      return this.validateAndCleanData(parsedData);
    } catch (error) {
      console.error('Erreur parsing JSON:', error);
      throw new Error('Erreur lors de l\'analyse des données du CV');
    }
  }

  private buildStructuringPrompt(cvText: string): string {
    return `
Analyse le texte de CV suivant et extrais les informations dans le format JSON demandé.

TEXTE DU CV:
${cvText}

INSTRUCTIONS:
1. Extrais toutes les expériences professionnelles avec les détails complets
2. Extrais toutes les formations/diplômes
3. Extrais toutes les compétences techniques et humaines
4. Extrais les informations personnelles si disponibles

FORMAT DE RÉPONSE (JSON strict, pas de commentaires):
{
  "experiences": [
    {
      "poste": "string",
      "entreprise": "string", 
      "lieu": "string ou null",
      "dateDebut": "YYYY-MM-DD ou YYYY-MM ou YYYY",
      "dateFin": "YYYY-MM-DD ou YYYY-MM ou YYYY ou null si en cours",
      "enCours": true/false,
      "description": "string ou null"
    }
  ],
  "formations": [
    {
      "diplome": "string",
      "etablissement": "string",
      "ville": "string ou null", 
      "dateDebut": "YYYY-MM-DD ou YYYY-MM ou YYYY",
      "dateFin": "YYYY-MM-DD ou YYYY-MM ou YYYY ou null si en cours",
      "enCours": true/false,
      "description": "string ou null"
    }
  ],
  "competences": [
    {
      "nom": "string",
      "categorie": "string ou null (ex: 'Techniques', 'Langues', 'Logiciels')"
    }
  ],
  "personalInfo": {
    "nom": "string ou null",
    "prenom": "string ou null", 
    "email": "string ou null",
    "telephone": "string ou null",
    "adresse": "string ou null"
  }
}

RÈGLES IMPORTANTES:
- Pour les dates, utilise le format le plus précis possible trouvé
- Si une expérience/formation est "en cours", mets enCours: true et dateFin: null
- Pour les compétences, groupe-les par catégorie logique si possible
- Ne mets pas de dates fictives, utilise null si pas d'info
- Assure-toi que le JSON soit valide et bien formaté
`;
  }

  private validateAndCleanData(data: any): ParsedCvData {
    const result: ParsedCvData = {
      experiences: [],
      formations: [],
      competences: [],
      personalInfo: {}
    };

    // Valider et nettoyer les expériences
    if (Array.isArray(data.experiences)) {
      result.experiences = data.experiences
        .filter((exp: any) => exp.poste && exp.entreprise)
        .map((exp: any) => ({
          poste: exp.poste || '',
          entreprise: exp.entreprise || '',
          lieu: exp.lieu || null,
          dateDebut: this.formatDate(exp.dateDebut),
          dateFin: exp.enCours ? null : this.formatDate(exp.dateFin),
          enCours: Boolean(exp.enCours),
          description: exp.description || null
        }));
    }

    // Valider et nettoyer les formations
    if (Array.isArray(data.formations)) {
      result.formations = data.formations
        .filter((form: any) => form.diplome && form.etablissement)
        .map((form: any) => ({
          diplome: form.diplome || '',
          etablissement: form.etablissement || '',
          ville: form.ville || null,
          dateDebut: this.formatDate(form.dateDebut),
          dateFin: form.enCours ? null : this.formatDate(form.dateFin),
          enCours: Boolean(form.enCours),
          description: form.description || null
        }));
    }

    // Valider et nettoyer les compétences
    if (Array.isArray(data.competences)) {
      result.competences = data.competences
        .filter((comp: any) => comp.nom)
        .map((comp: any) => ({
          nom: comp.nom || '',
          categorie: comp.categorie || null
        }));
    }

    // Valider les infos personnelles
    if (data.personalInfo && typeof data.personalInfo === 'object') {
      result.personalInfo = {
        nom: data.personalInfo.nom || null,
        prenom: data.personalInfo.prenom || null,
        email: data.personalInfo.email || null,
        telephone: data.personalInfo.telephone || null,
        adresse: data.personalInfo.adresse || null
      };
    }

    return result;
  }

  private formatDate(dateStr: any): string | null {
    if (!dateStr) return null;
    
    // Si c'est déjà une chaîne au bon format, on la retourne
    if (typeof dateStr === 'string') {
      // Valider que c'est un format de date acceptable
      const dateRegex = /^\d{4}(-\d{2})?(-\d{2})?$/;
      if (dateRegex.test(dateStr)) {
        return dateStr;
      }
    }

    // Tentative de parsing si c'est un autre format
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      }
    } catch {
      console.warn('Format de date non reconnu:', dateStr);
    }

    return null;
  }
}