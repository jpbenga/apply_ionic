import { Injectable } from '@angular/core';
import * as mammoth from 'mammoth';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
import { StorageService } from '../storage/storage.service';
import { getAtsAnalysisPrompt } from './prompts/ats-analysis.prompt';
import { getCoverLetterPrompt } from './prompts/cover-letter.prompt';
// Ajoutez ces imports après les imports existants
import { getCvImprovementPrompt } from './prompts/cv-improvement.prompt';
import { CvImprovementResponse, CvImprovement, CvImprovementResult } from 'src/app/models/cv-improvement.model';

import { getStructuredCvImprovementPrompt } from './prompts/cv-structured-improvement.prompt';
import { 
  StructuredCvImprovementResponse, 
  StructuredCvImprovementResult,
  SectionImprovement,
  SuggestedCompetence
} from 'src/app/models/cv-structured-improvement.model';
import { GeneratedCv } from 'src/app/models/cv-template.model';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';
import { Competence } from 'src/app/models/competence.model';

export interface OpenAIResponse {
  success: boolean;
  response?: string;
  message?: string;
}

export interface ATSAnalysisResult {
  jobTitle: string | null;
  company: string | null;
  analysisText: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {

  constructor(
    private functions: Functions,
    private storageService: StorageService
  ) { }

  async extractTextFromDocx(file: File): Promise<string> {
    if (!file) {
      return Promise.reject('Aucun fichier fourni.');
    }
    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && !file.name.toLowerCase().endsWith('.docx')) {
      console.warn(`AIService: Type de fichier non DOCX (${file.type}) fourni à extractTextFromDocx.`);
      return Promise.reject('Type de fichier non supporté pour l\'extraction DOCX côté client (uniquement .docx).');
    }
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result instanceof ArrayBuffer) {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
            resolve(result.value);
          } catch (error) {
            console.error('AIService: Erreur d\'extraction Mammoth:', error);
            reject('Erreur lors de l\'extraction du texte du fichier DOCX.');
          }
        } else {
          reject('AIService: Erreur de lecture du fichier DOCX (résultat non ArrayBuffer).');
        }
      };
      reader.onerror = () => {
        console.error('AIService: Erreur FileReader pour DOCX:', reader.error);
        reject('Erreur lors de la lecture du fichier DOCX.');
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async getTextFromPdfViaFunction(file: File): Promise<string> {
    if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      throw new Error('AIService: Fichier PDF invalide ou non fourni.');
    }
    try {
      const pdfUrl = await this.storageService.uploadFile(file, 'temp_cv_pdfs_for_extraction');
      const extractPdfTextFn = httpsCallable(this.functions, 'extractPdfText');
      const result = await extractPdfTextFn({ pdfUrl: pdfUrl, fileName: file.name });
      const data = result.data as { success: boolean; text?: string; pageCount?: number; message?: string };
      if (data.success && typeof data.text === 'string') {
        return data.text;
      } else {
        console.error('AIService: La fonction extractPdfText a retourné un échec ou pas de texte:', data);
        throw new Error(data.message || 'Erreur lors de l\'extraction du texte PDF par la fonction.');
      }
    } catch (error) {
      console.error('AIService: Erreur dans getTextFromPdfViaFunction:', error);
      if (error instanceof Error) {
         throw new Error(`Échec de l'extraction du PDF : ${error.message}`);
      }
      throw new Error('Échec de l\'extraction du PDF : Erreur inconnue.');
    }
  }

  async getATSAnalysis(jobOfferText: string, cvText: string): Promise<ATSAnalysisResult> {
    const prompt = getAtsAnalysisPrompt(jobOfferText, cvText);
    const callOpenAiFn = httpsCallable(this.functions, 'callOpenAi');

    try {
      const result = await callOpenAiFn({ prompt }) as HttpsCallableResult;
      const data = result.data as OpenAIResponse;

      if (data.success && data.response) {
        const lines = data.response.split('\n');
        let jobTitle: string | null = null;
        let company: string | null = null;
        let analysisTextStartIndex = 0;

        if (lines[0] && lines[0].toUpperCase().startsWith("TITRE_POSTE:")) {
          jobTitle = lines[0].substring("TITRE_POSTE:".length).trim();
          jobTitle = jobTitle === "Non trouvé" ? null : jobTitle;
          analysisTextStartIndex++;
        }
        if (lines.length > analysisTextStartIndex && lines[analysisTextStartIndex] && lines[analysisTextStartIndex].toUpperCase().startsWith("ENTREPRISE:")) {
          company = lines[analysisTextStartIndex].substring("ENTREPRISE:".length).trim();
          company = company === "Non trouvé" ? null : company;
          analysisTextStartIndex++;
        }

        const analysisText = lines.slice(analysisTextStartIndex).join('\n').trim();

        return { jobTitle, company, analysisText };
      } else {
        throw new Error(data.message || "L'analyse ATS a échoué ou la réponse est invalide.");
      }
    } catch (error) {
      console.error('AIService: Erreur lors de l\'appel à callOpenAi pour ATSAnalysis:', error);
      if (error instanceof Error) {
        throw new Error(`Échec de l'analyse ATS : ${error.message}`);
      }
      throw new Error("Échec de l'analyse ATS : Erreur inconnue.");
    }
  }

  async generateCoverLetter(jobOfferText: string, cvText: string): Promise<string> {
    const prompt = getCoverLetterPrompt(jobOfferText, cvText);
    const callOpenAiFn = httpsCallable(this.functions, 'callOpenAi');

    try {
      const result = await callOpenAiFn({ prompt }) as HttpsCallableResult;
      const data = result.data as OpenAIResponse;

      if (data.success && data.response) {
        return data.response;
      } else {
        throw new Error(data.message || "La génération de la lettre de motivation a échoué ou la réponse est invalide.");
      }
    } catch (error) {
      console.error('AIService: Erreur lors de l\'appel à callOpenAi pour generateCoverLetter:', error);
      if (error instanceof Error) {
        throw new Error(`Échec de la génération de la lettre : ${error.message}`);
      }
      throw new Error("Échec de la génération de la lettre : Erreur inconnue.");
    }
  }
  async improveCvText(jobOfferText: string, cvText: string): Promise<CvImprovementResponse> {
    const prompt = getCvImprovementPrompt(jobOfferText, cvText);
    const callOpenAiFn = httpsCallable(this.functions, 'callOpenAi');

    try {
      const result = await callOpenAiFn({ prompt }) as HttpsCallableResult;
      const data = result.data as OpenAIResponse;

      if (data.success && data.response) {
        try {
          // Parse la réponse JSON de l'IA
          const aiResponse = JSON.parse(data.response);
          
          // Validation et nettoyage des données
          const improvements: CvImprovement[] = aiResponse.improvements?.map((imp: any, index: number) => ({
            id: imp.id || `improvement_${index}`,
            type: imp.type || 'reformulation',
            section: imp.section || 'Section inconnue',
            titre: imp.titre || 'Amélioration suggérée',
            textOriginal: imp.textOriginal || '',
            textAmeliore: imp.textAmeliore || '',
            explication: imp.explication || '',
            impact: imp.impact || 'moyen',
            accepted: false // Par défaut, non acceptée
          })) || [];

          const summary = {
            totalSuggestions: improvements.length,
            criticalIssues: improvements.filter(imp => imp.impact === 'fort' && (imp.type === 'orthographe' || imp.type === 'structure')).length,
            enhancementSuggestions: improvements.filter(imp => imp.type === 'reformulation' || imp.type === 'mots-cles').length,
            atsKeywords: aiResponse.summary?.atsKeywords || []
          };

          return {
            success: true,
            improvements,
            summary
          };
        } catch (parseError) {
          console.error('AIService: Erreur parsing JSON de l\'amélioration CV:', parseError);
          console.log('Réponse brute de l\'IA:', data.response);
          throw new Error('Erreur lors de l\'analyse de la réponse d\'amélioration du CV. Veuillez réessayer.');
        }
      } else {
        throw new Error(data.message || "L'amélioration du CV a échoué ou la réponse est invalide.");
      }
    } catch (error) {
      console.error('AIService: Erreur lors de l\'appel d\'amélioration CV:', error);
      if (error instanceof Error) {
        throw new Error(`Échec de l'amélioration du CV : ${error.message}`);
      }
      throw new Error("Échec de l'amélioration du CV : Erreur inconnue.");
    }
  }

  // Méthode pour appliquer les améliorations acceptées
  applyCvImprovements(originalText: string, improvements: CvImprovement[]): CvImprovementResult {
    let improvedText = originalText;
    const appliedImprovements: CvImprovement[] = [];

    // Applique les améliorations acceptées dans l'ordre inverse pour éviter les décalages de position
    const acceptedImprovements = improvements
      .filter(imp => imp.accepted)
      .sort((a, b) => originalText.lastIndexOf(b.textOriginal) - originalText.lastIndexOf(a.textOriginal));

    for (const improvement of acceptedImprovements) {
      if (improvement.textOriginal && improvement.textAmeliore) {
        // Remplace seulement la première occurrence pour éviter les remplacements involontaires
        const index = improvedText.indexOf(improvement.textOriginal);
        if (index !== -1) {
          improvedText = 
            improvedText.substring(0, index) + 
            improvement.textAmeliore + 
            improvedText.substring(index + improvement.textOriginal.length);
          appliedImprovements.push(improvement);
        }
      }
    }

    return {
      originalText,
      improvedText,
      appliedImprovements
    };
  }
  /**
   * Améliore un CV structuré (GeneratedCv) par rapport à une offre d'emploi
   */
  async improveStructuredCv(jobOfferText: string, cvData: GeneratedCv): Promise<StructuredCvImprovementResponse> {
    const prompt = getStructuredCvImprovementPrompt(jobOfferText, cvData);
    const callOpenAiFn = httpsCallable(this.functions, 'callOpenAi');

    try {
      const result = await callOpenAiFn({ prompt }) as HttpsCallableResult;
      const data = result.data as OpenAIResponse;

      if (data.success && data.response) {
        try {
          // Parse la réponse JSON de l'IA
          const aiResponse = JSON.parse(data.response);
          
          // Validation et nettoyage des données
          const improvements = {
            experiences: this.validateSectionImprovements(aiResponse.improvements?.experiences || [], 'experience'),
            formations: this.validateSectionImprovements(aiResponse.improvements?.formations || [], 'formation'),
            competences: this.validateSectionImprovements(aiResponse.improvements?.competences || [], 'competence'),
            suggestedCompetences: this.validateSuggestedCompetences(aiResponse.improvements?.suggestedCompetences || [])
          };

          const summary = {
            totalSuggestions: this.countTotalSuggestions(improvements),
            criticalIssues: this.countCriticalIssues(improvements),
            enhancementSuggestions: this.countEnhancementSuggestions(improvements),
            newCompetencesSuggested: improvements.suggestedCompetences.length,
            atsKeywordsIntegrated: this.countAtsKeywords(improvements)
          };

          return {
            success: true,
            improvements,
            summary
          };
        } catch (parseError) {
          console.error('AIService: Erreur parsing JSON de l\'amélioration CV structuré:', parseError);
          console.log('Réponse brute de l\'IA:', data.response);
          throw new Error('Erreur lors de l\'analyse de la réponse d\'amélioration du CV structuré. Veuillez réessayer.');
        }
      } else {
        throw new Error(data.message || "L'amélioration du CV structuré a échoué ou la réponse est invalide.");
      }
    } catch (error) {
      console.error('AIService: Erreur lors de l\'appel d\'amélioration CV structuré:', error);
      if (error instanceof Error) {
        throw new Error(`Échec de l'amélioration du CV structuré : ${error.message}`);
      }
      throw new Error("Échec de l'amélioration du CV structuré : Erreur inconnue.");
    }
  }

  /**
   * Applique les améliorations structurées acceptées aux données du CV
   */
  applyStructuredCvImprovements(originalCv: GeneratedCv, improvements: StructuredCvImprovementResponse): StructuredCvImprovementResult {
    // Clone profond des données originales
    const originalData = {
      experiences: JSON.parse(JSON.stringify(originalCv.data.experiences || [])),
      formations: JSON.parse(JSON.stringify(originalCv.data.formations || [])),
      competences: JSON.parse(JSON.stringify(originalCv.data.competences || []))
    };

    const improvedData = {
      experiences: JSON.parse(JSON.stringify(originalCv.data.experiences || [])),
      formations: JSON.parse(JSON.stringify(originalCv.data.formations || [])),
      competences: JSON.parse(JSON.stringify(originalCv.data.competences || []))
    };

    const appliedImprovements = {
      experiences: [] as SectionImprovement[],
      formations: [] as SectionImprovement[],
      competences: [] as SectionImprovement[],
      addedCompetences: [] as SuggestedCompetence[]
    };

    let changesCount = { experiences: 0, formations: 0, competences: 0, total: 0 };

    // Appliquer les améliorations d'expériences
    improvements.improvements.experiences.forEach(sectionImprovement => {
      const acceptedImprovements = sectionImprovement.improvements.filter(imp => imp.accepted);
      if (acceptedImprovements.length > 0 && improvedData.experiences[sectionImprovement.itemIndex]) {
        acceptedImprovements.forEach(improvement => {
          const experience = improvedData.experiences[sectionImprovement.itemIndex];
          if (experience && improvement.field in experience) {
            (experience as any)[improvement.field] = improvement.improvedValue;
            changesCount.experiences++;
          }
        });
        appliedImprovements.experiences.push({
          ...sectionImprovement,
          improvements: acceptedImprovements
        });
      }
    });

    // Appliquer les améliorations de formations
    improvements.improvements.formations.forEach(sectionImprovement => {
      const acceptedImprovements = sectionImprovement.improvements.filter(imp => imp.accepted);
      if (acceptedImprovements.length > 0 && improvedData.formations[sectionImprovement.itemIndex]) {
        acceptedImprovements.forEach(improvement => {
          const formation = improvedData.formations[sectionImprovement.itemIndex];
          if (formation && improvement.field in formation) {
            (formation as any)[improvement.field] = improvement.improvedValue;
            changesCount.formations++;
          }
        });
        appliedImprovements.formations.push({
          ...sectionImprovement,
          improvements: acceptedImprovements
        });
      }
    });

    // Appliquer les améliorations de compétences
    improvements.improvements.competences.forEach(sectionImprovement => {
      const acceptedImprovements = sectionImprovement.improvements.filter(imp => imp.accepted);
      if (acceptedImprovements.length > 0 && improvedData.competences[sectionImprovement.itemIndex]) {
        acceptedImprovements.forEach(improvement => {
          const competence = improvedData.competences[sectionImprovement.itemIndex];
          if (competence && improvement.field in competence) {
            (competence as any)[improvement.field] = improvement.improvedValue;
            changesCount.competences++;
          }
        });
        appliedImprovements.competences.push({
          ...sectionImprovement,
          improvements: acceptedImprovements
        });
      }
    });

    // Ajouter les nouvelles compétences acceptées
    const acceptedNewCompetences = improvements.improvements.suggestedCompetences.filter(comp => comp.accepted);
    acceptedNewCompetences.forEach(suggestedComp => {
      const newCompetence: Competence = {
        userId: originalCv.userId,
        nom: suggestedComp.nom,
        categorie: suggestedComp.categorie
      };
      improvedData.competences.push(newCompetence);
      appliedImprovements.addedCompetences.push(suggestedComp);
      changesCount.competences++;
    });

    changesCount.total = changesCount.experiences + changesCount.formations + changesCount.competences;

    return {
      originalData,
      improvedData,
      appliedImprovements,
      changesCount
    };
  }

  // Méthodes utilitaires privées pour la validation
  private validateSectionImprovements(sections: any[], type: string): SectionImprovement[] {
    return sections.map((section, index) => ({
      id: section.id || `${type}_${index}`,
      sectionType: section.sectionType || type,
      itemIndex: section.itemIndex || index,
      itemId: section.itemId,
      itemTitle: section.itemTitle || `${type} ${index + 1}`,
      improvements: (section.improvements || []).map((imp: any, impIndex: number) => ({
        id: imp.id || `${type}_imp_${index}_${impIndex}`,
        type: imp.type || 'reformulation',
        field: imp.field || 'description',
        titre: imp.titre || 'Amélioration suggérée',
        originalValue: imp.originalValue || '',
        improvedValue: imp.improvedValue || '',
        explication: imp.explication || '',
        impact: imp.impact || 'moyen',
        accepted: false
      }))
    }));
  }

  private validateSuggestedCompetences(competences: any[]): SuggestedCompetence[] {
    return competences.map((comp, index) => ({
      id: comp.id || `new_comp_${index}`,
      nom: comp.nom || '',
      categorie: comp.categorie || 'Autre',
      raison: comp.raison || '',
      impact: comp.impact || 'moyen',
      accepted: false
    }));
  }

  private countTotalSuggestions(improvements: any): number {
    return improvements.experiences.reduce((sum: number, exp: any) => sum + exp.improvements.length, 0) +
           improvements.formations.reduce((sum: number, form: any) => sum + form.improvements.length, 0) +
           improvements.competences.reduce((sum: number, comp: any) => sum + comp.improvements.length, 0) +
           improvements.suggestedCompetences.length;
  }

  private countCriticalIssues(improvements: any): number {
    const countInSection = (sections: any[]) => 
      sections.reduce((sum: number, section: any) => 
        sum + section.improvements.filter((imp: any) => imp.impact === 'fort' && imp.type === 'orthographe').length, 0);
    
    return countInSection(improvements.experiences) +
           countInSection(improvements.formations) +
           countInSection(improvements.competences);
  }

  private countEnhancementSuggestions(improvements: any): number {
    const countInSection = (sections: any[]) => 
      sections.reduce((sum: number, section: any) => 
        sum + section.improvements.filter((imp: any) => imp.type === 'reformulation' || imp.type === 'mots-cles').length, 0);
    
    return countInSection(improvements.experiences) +
           countInSection(improvements.formations) +
           countInSection(improvements.competences);
  }

  private countAtsKeywords(improvements: any): number {
    const countInSection = (sections: any[]) => 
      sections.reduce((sum: number, section: any) => 
        sum + section.improvements.filter((imp: any) => imp.type === 'mots-cles').length, 0);
    
    return countInSection(improvements.experiences) +
           countInSection(improvements.formations) +
           countInSection(improvements.competences) +
           improvements.suggestedCompetences.length;
  }
}