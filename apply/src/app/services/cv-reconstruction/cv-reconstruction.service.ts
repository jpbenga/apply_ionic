// src/app/services/cv-reconstruction/cv-reconstruction.service.ts

import { Injectable } from '@angular/core';
import { CvTemplate, CvTheme, CvData } from 'src/app/models/cv-template.model';
import { Candidature } from 'src/app/features/candidatures/models/candidature.model';
import { CvTemplateService } from '../cv-template/cv-template.service';

export interface ReconstructedCv {
  cvData: CvData | null;
  template: CvTemplate | null;
  theme: CvTheme | null;
  hasValidData: boolean;
  missingFields: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CvReconstructionService {

  constructor(
    private cvTemplateService: CvTemplateService
  ) {}

  /**
   * Reconstruit un CV complet à partir d'une candidature
   */
  reconstructCvFromCandidature(candidature: Candidature): ReconstructedCv {
    console.log('🔧 Reconstruction CV pour candidature:', candidature.id);

    // Vérifier la disponibilité des données
    const validation = this.validateCandidatureData(candidature);
    
    if (!validation.hasValidData) {
      console.warn('❌ Données insuffisantes pour reconstruction:', validation.missingFields);
      return {
        cvData: null,
        template: null,
        theme: null,
        hasValidData: false,
        missingFields: validation.missingFields
      };
    }

    try {
      // 1. Reconstruire les données CV
      const cvData: CvData = {
        userId: candidature.userId,
        experiences: candidature.cvDataSnapshot!.experiences || [],
        formations: candidature.cvDataSnapshot!.formations || [],
        competences: candidature.cvDataSnapshot!.competences || [],
        templateId: candidature.cvTemplateId!,
        theme: candidature.cvTheme || { primaryColor: '#007bff' }
      };

      // 2. Récupérer le template
      const template = this.cvTemplateService.getTemplateById(candidature.cvTemplateId!);
      
      if (!template) {
        console.warn(`⚠️ Template non trouvé: ${candidature.cvTemplateId}`);
        return {
          cvData,
          template: null,
          theme: candidature.cvTheme || { primaryColor: '#007bff' },
          hasValidData: false,
          missingFields: ['template_not_found']
        };
      }

      // 3. Construire le résultat
      const result: ReconstructedCv = {
        cvData,
        template,
        theme: candidature.cvTheme || { primaryColor: '#007bff' },
        hasValidData: true,
        missingFields: []
      };

      console.log('✅ CV reconstruit avec succès:', {
        template: template.name,
        theme: result.theme?.primaryColor,
        experiences: cvData.experiences.length,
        formations: cvData.formations.length,
        competences: cvData.competences.length
      });

      return result;

    } catch (error) {
      console.error('❌ Erreur lors de la reconstruction:', error);
      return {
        cvData: null,
        template: null,
        theme: null,
        hasValidData: false,
        missingFields: ['reconstruction_error']
      };
    }
  }

  /**
   * Valide que la candidature contient les données nécessaires
   */
  private validateCandidatureData(candidature: Candidature): { hasValidData: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    // Vérifier cvDataSnapshot
    if (!candidature.cvDataSnapshot) {
      missingFields.push('cvDataSnapshot');
    } else {
      // Vérifier que le snapshot contient au moins des arrays vides
      if (!candidature.cvDataSnapshot.experiences) missingFields.push('cvDataSnapshot.experiences');
      if (!candidature.cvDataSnapshot.formations) missingFields.push('cvDataSnapshot.formations');
      if (!candidature.cvDataSnapshot.competences) missingFields.push('cvDataSnapshot.competences');
    }

    // Vérifier cvTemplateId
    if (!candidature.cvTemplateId) {
      missingFields.push('cvTemplateId');
    }

    // cvTheme est optionnel, on peut utiliser une valeur par défaut

    const hasValidData = missingFields.length === 0;

    return { hasValidData, missingFields };
  }

  /**
   * Génère un texte descriptif du CV pour preview
   */
  generateCvPreviewText(reconstructed: ReconstructedCv): string {
    if (!reconstructed.hasValidData || !reconstructed.cvData) {
      return 'Impossible de générer l\'aperçu du CV.';
    }

    const { cvData } = reconstructed;
    let text = '';

    // Expériences
    if (cvData.experiences.length > 0) {
      text += `💼 EXPÉRIENCES (${cvData.experiences.length})\n`;
      cvData.experiences.slice(0, 3).forEach((exp, index) => {
        text += `${index + 1}. ${exp.poste} - ${exp.entreprise}\n`;
      });
      if (cvData.experiences.length > 3) {
        text += `... et ${cvData.experiences.length - 3} autre(s)\n`;
      }
      text += '\n';
    }

    // Formations
    if (cvData.formations.length > 0) {
      text += `🎓 FORMATIONS (${cvData.formations.length})\n`;
      cvData.formations.slice(0, 2).forEach((form, index) => {
        text += `${index + 1}. ${form.diplome} - ${form.etablissement}\n`;
      });
      if (cvData.formations.length > 2) {
        text += `... et ${cvData.formations.length - 2} autre(s)\n`;
      }
      text += '\n';
    }

    // Compétences
    if (cvData.competences.length > 0) {
      text += `🛠️ COMPÉTENCES (${cvData.competences.length})\n`;
      const competenceNames = cvData.competences.slice(0, 6).map(c => c.nom);
      text += competenceNames.join(', ');
      if (cvData.competences.length > 6) {
        text += ` ... (+${cvData.competences.length - 6})`;
      }
      text += '\n';
    }

    return text || 'CV vide';
  }

  /**
   * Vérifie si une candidature peut être reconstruite
   */
  canReconstructCv(candidature: Candidature): boolean {
    return this.validateCandidatureData(candidature).hasValidData;
  }

  /**
   * Obtient les informations sur le template d'une candidature
   */
  getCandidatureTemplateInfo(candidature: Candidature): { templateName: string; themeName: string } {
    const template = candidature.cvTemplateId 
      ? this.cvTemplateService.getTemplateById(candidature.cvTemplateId)
      : null;

    return {
      templateName: template?.name || 'Template inconnu',
      themeName: candidature.cvTheme?.primaryColor || '#007bff'
    };
  }

  /**
   * Statistiques sur les données CV d'une candidature
   */
  getCvDataStats(candidature: Candidature): { experiences: number; formations: number; competences: number; total: number } {
    if (!candidature.cvDataSnapshot) {
      return { experiences: 0, formations: 0, competences: 0, total: 0 };
    }

    const experiences = candidature.cvDataSnapshot.experiences?.length || 0;
    const formations = candidature.cvDataSnapshot.formations?.length || 0;
    const competences = candidature.cvDataSnapshot.competences?.length || 0;

    return {
      experiences,
      formations,
      competences,
      total: experiences + formations + competences
    };
  }
}

// OPTIONNEL : Interface pour faciliter l'usage dans les composants
export interface CvReconstructionResult {
  success: boolean;
  cv?: ReconstructedCv;
  error?: string;
  previewText?: string;
}