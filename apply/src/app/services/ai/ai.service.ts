import { Injectable } from '@angular/core';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
import { FileExtractionService } from '../../shared/services/file-extraction/file-extraction.service';
import { getAtsAnalysisPrompt } from './prompts/ats-analysis.prompt';
import { getCoverLetterPrompt } from './prompts/cover-letter.prompt';
import getCvImprovementPrompt from './prompts/cv-improvement.prompt';
import { getStructuredCvImprovementPrompt } from './prompts/cv-structured-improvement.prompt';
import { CvImprovementResponse, CvImprovement, CvImprovementResult } from 'src/app/models/cv-improvement.model';
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
import { UserProfile } from 'src/app/features/profile/models/user-profile.model';

export interface OpenAIResponse {
  success: boolean;
  response?: string;
  message?: string;
}

export interface ATSAnalysisResult {
  jobTitle: string | null;
  company: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  analysisText: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {

  constructor(
    private functions: Functions,
    private fileExtractionService: FileExtractionService
  ) { }

  async extractTextFromDocx(file: File): Promise<string> {
    if (!file) {
      throw new Error('AIService: Aucun fichier DOCX fourni.');
    }
    try {
      return await this.fileExtractionService.extractTextFromFile(file);
    } catch (error) {
      console.error('AIService: Erreur lors de l\'extraction du texte DOCX via FileExtractionService:', error);
      throw error;
    }
  }

  async extractTextFromPdf(file: File): Promise<string> {
    if (!file) {
      throw new Error('AIService: Aucun fichier PDF fourni.');
    }
    try {
      return await this.fileExtractionService.extractTextFromFile(file);
    } catch (error) {
      console.error('AIService: Erreur lors de l\'extraction du texte PDF via FileExtractionService:', error);
      throw error;
    }
  }

  async getATSAnalysis(jobOfferText: string, cvText: string): Promise<ATSAnalysisResult> {
    const prompt = getAtsAnalysisPrompt(jobOfferText, cvText);
    const callOpenAiFn = httpsCallable(this.functions, 'callOpenAi');

    try {
      const result = await callOpenAiFn({ prompt }) as HttpsCallableResult;
      const data = result.data as OpenAIResponse;

      if (data.success && data.response) {
        try {
          const jsonString = data.response.substring(data.response.indexOf('{'), data.response.lastIndexOf('}') + 1);
          const parsedResponse = JSON.parse(jsonString);

          const analysisResult: ATSAnalysisResult = {
            jobTitle: parsedResponse.jobTitle || null,
            company: parsedResponse.companyName || null,
            contactPerson: parsedResponse.contactPerson || null,
            contactEmail: parsedResponse.contactEmail || null,
            analysisText: parsedResponse.analysisText || "Analyse non fournie."
          };

          return analysisResult;

        } catch (jsonError) {
          console.error('AIService: Erreur parsing JSON de getATSAnalysis:', jsonError, "Réponse reçue:", data.response);
          throw new Error("La réponse de l'analyse n'est pas un JSON valide.");
        }
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

  async generateCoverLetter(
    jobOfferText: string,
    cvText: string
  ): Promise<string> {
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
          const aiResponse = JSON.parse(data.response);
         
          const improvements: CvImprovement[] = aiResponse.improvements?.map((imp: any, index: number) => ({
            id: imp.id || `improvement_${index}`,
            type: imp.type || 'reformulation',
            section: imp.section || 'Section inconnue',
            titre: imp.titre || 'Amélioration suggérée',
            textOriginal: imp.textOriginal || '',
            textAmeliore: imp.textAmeliore || '',
            explication: imp.explication || '',
            impact: imp.impact || 'moyen',
            accepted: false
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
          throw new Error('Erreur lors de l\'analyse de la réponse d\'amélioration du CV.');
        }
      } else {
        throw new Error(data.message || "L'amélioration du CV a échoué.");
      }
    } catch (error) {
      console.error('AIService: Erreur lors de l\'appel d\'amélioration CV:', error);
      if (error instanceof Error) {
        throw new Error(`Échec de l'amélioration du CV : ${error.message}`);
      }
      throw new Error("Échec de l'amélioration du CV : Erreur inconnue.");
    }
  }

  applyCvImprovements(originalText: string, improvements: CvImprovement[]): CvImprovementResult {
    let improvedText = originalText;
    const appliedImprovements: CvImprovement[] = [];

    const acceptedImprovements = improvements
      .filter(imp => imp.accepted)
      .sort((a, b) => originalText.lastIndexOf(b.textOriginal) - originalText.lastIndexOf(a.textOriginal));

    for (const improvement of acceptedImprovements) {
      if (improvement.textOriginal && improvement.textAmeliore) {
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

  async improveStructuredCv(jobOfferText: string, cvData: GeneratedCv): Promise<StructuredCvImprovementResponse> {
    const prompt = getStructuredCvImprovementPrompt(jobOfferText, cvData);
    const callOpenAiFn = httpsCallable(this.functions, 'callOpenAi');

    try {
      const result = await callOpenAiFn({ prompt }) as HttpsCallableResult;
      const data = result.data as OpenAIResponse;

      if (data.success && data.response) {
        try {
          const cleanedResponse = this.cleanJsonResponse(data.response);
          const aiResponse = JSON.parse(cleanedResponse);

          const improvements = {
            experiences: this.validateAndSanitizeSectionImprovements(aiResponse.improvements?.experiences || [], 'experience'),
            formations: this.validateAndSanitizeSectionImprovements(aiResponse.improvements?.formations || [], 'formation'),
            competences: this.validateAndSanitizeSectionImprovements(aiResponse.improvements?.competences || [], 'competence'),
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
          console.error('Erreur parsing JSON:', parseError);
          throw new Error('Erreur lors de l\'analyse de la réponse d\'amélioration du CV structuré.');
        }
      } else {
        throw new Error(data.message || "L'amélioration du CV structuré a échoué.");
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel d\'amélioration CV structuré:', error);
      if (error instanceof Error) {
        throw new Error(`Échec de l'amélioration du CV structuré : ${error.message}`);
      }
      throw new Error("Échec de l'amélioration du CV structuré : Erreur inconnue.");
    }
  }

  applyStructuredCvImprovements(originalCv: GeneratedCv, improvements: StructuredCvImprovementResponse): StructuredCvImprovementResult {
    const originalData = {
      experiences: this.deepClone(originalCv.data.experiences || []),
      formations: this.deepClone(originalCv.data.formations || []),
      competences: this.deepClone(originalCv.data.competences || [])
    };

    const improvedData = {
      experiences: this.deepClone(originalCv.data.experiences || []),
      formations: this.deepClone(originalCv.data.formations || []),
      competences: this.deepClone(originalCv.data.competences || [])
    };

    const appliedImprovements = {
      experiences: [] as SectionImprovement[],
      formations: [] as SectionImprovement[],
      competences: [] as SectionImprovement[],
      addedCompetences: [] as SuggestedCompetence[]
    };

    let changesCount = { experiences: 0, formations: 0, competences: 0, total: 0 };

    improvements.improvements.experiences.forEach(sectionImprovement => {
      const accepted = sectionImprovement.improvements.filter(imp => imp.accepted);
      if (accepted.length > 0) {
        const expIndex = sectionImprovement.itemIndex;
        if (expIndex >= 0 && expIndex < improvedData.experiences.length) {
          const experience = improvedData.experiences[expIndex];
          accepted.forEach(improvement => {
            if (this.isValidExperienceField(improvement.field)) {
              (experience as any)[improvement.field] = improvement.improvedValue;
              changesCount.experiences++;
            }
          });
          appliedImprovements.experiences.push({ ...sectionImprovement, improvements: accepted });
        }
      }
    });

    improvements.improvements.formations.forEach(sectionImprovement => {
      const accepted = sectionImprovement.improvements.filter(imp => imp.accepted);
      if (accepted.length > 0) {
        const formIndex = sectionImprovement.itemIndex;
        if (formIndex >= 0 && formIndex < improvedData.formations.length) {
          const formation = improvedData.formations[formIndex];
          accepted.forEach(improvement => {
            if (this.isValidFormationField(improvement.field)) {
              (formation as any)[improvement.field] = improvement.improvedValue;
              changesCount.formations++;
            }
          });
          appliedImprovements.formations.push({ ...sectionImprovement, improvements: accepted });
        }
      }
    });

    improvements.improvements.competences.forEach(sectionImprovement => {
      const accepted = sectionImprovement.improvements.filter(imp => imp.accepted);
      if (accepted.length > 0) {
        const compIndex = sectionImprovement.itemIndex;
        if (compIndex >= 0 && compIndex < improvedData.competences.length) {
          const competence = improvedData.competences[compIndex];
          accepted.forEach(improvement => {
            if (this.isValidCompetenceField(improvement.field)) {
              (competence as any)[improvement.field] = improvement.improvedValue;
              changesCount.competences++;
            }
          });
          appliedImprovements.competences.push({ ...sectionImprovement, improvements: accepted });
        }
      }
    });

    const acceptedNewCompetences = improvements.improvements.suggestedCompetences.filter(comp => comp.accepted);
    acceptedNewCompetences.forEach(suggestedComp => {
      const newCompetence: Competence = {
        userId: originalCv.userId,
        nom: suggestedComp.nom,
        categorie: suggestedComp.categorie
      };
      const exists = improvedData.competences.some(comp => comp.nom.toLowerCase().trim() === newCompetence.nom.toLowerCase().trim());
      if (!exists) {
        improvedData.competences.push(newCompetence);
        appliedImprovements.addedCompetences.push(suggestedComp);
        changesCount.competences++;
      }
    });

    changesCount.total = changesCount.experiences + changesCount.formations + changesCount.competences;

    return {
      originalData,
      improvedData,
      appliedImprovements,
      changesCount
    };
  }

  private cleanJsonResponse(response: string): string {
    let cleaned = response.trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    return cleaned;
  }

  private validateAndSanitizeSectionImprovements(sections: any[], type: string): SectionImprovement[] {
    if (!Array.isArray(sections)) return [];

    return sections.map((section, index) => {
      const validatedSection: SectionImprovement = {
        id: section.id || `${type}_section_${index}`,
        sectionType: section.sectionType || type,
        itemIndex: typeof section.itemIndex === 'number' ? section.itemIndex : index,
        itemId: section.itemId || undefined,
        itemTitle: section.itemTitle || `${type} ${index + 1}`,
        improvements: []
      };

      if (Array.isArray(section.improvements)) {
        validatedSection.improvements = section.improvements.map((imp: any, impIndex: number) => {
          if (imp.field === 'description' && typeof imp.improvedValue === 'string') {
            imp.improvedValue = imp.improvedValue
              .split(/\n\s*-\s*|\n\s*•\s*|\n/)
              .map((line: string) => line.replace(/^-|•/, '').trim())
              .filter((line: string) => line.length > 0);
          }
          return {
            id: imp.id || `${type}_imp_${index}_${impIndex}`,
            type: this.validateImprovementType(imp.type),
            field: imp.field || 'description',
            titre: imp.titre || 'Amélioration suggérée',
            originalValue: imp.originalValue || '',
            improvedValue: imp.improvedValue || [],
            explication: imp.explication || '',
            impact: this.validateImpact(imp.impact),
            accepted: false
          };
        });
      }
      return validatedSection;
    }).filter(section => section.improvements.length > 0);
  }
 
  private validateSuggestedCompetences(competences: any[]): SuggestedCompetence[] {
    if (!Array.isArray(competences)) return [];
    return competences.map((comp, index) => ({
      id: comp.id || `new_comp_${index}`,
      nom: comp.nom || `Compétence ${index + 1}`,
      categorie: comp.categorie || 'Autre',
      raison: comp.raison || 'Recommandée pour ce poste',
      impact: this.validateImpact(comp.impact),
      accepted: false
    })).filter(comp => comp.nom.trim() !== '');
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private validateImprovementType(type: any): string {
    const validTypes = ['orthographe', 'reformulation', 'mots-cles', 'structure', 'ajout'];
    return validTypes.includes(type) ? type : 'reformulation';
  }

  private validateImpact(impact: any): 'faible' | 'moyen' | 'fort' {
    const validImpacts = ['faible', 'moyen', 'fort'];
    return validImpacts.includes(impact) ? impact : 'moyen';
  }

  private isValidExperienceField(field: string): boolean {
    const validFields = ['poste', 'entreprise', 'description', 'lieu'];
    return validFields.includes(field);
  }

  private isValidFormationField(field: string): boolean {
    const validFields = ['diplome', 'etablissement', 'description', 'ville'];
    return validFields.includes(field);
  }

  private isValidCompetenceField(field: string): boolean {
    const validFields = ['nom', 'categorie'];
    return validFields.includes(field);
  }

  private countTotalSuggestions(improvements: any): number {
    const experiencesCount = improvements.experiences?.reduce((sum: number, exp: any) => sum + (exp.improvements?.length || 0), 0) || 0;
    const formationsCount = improvements.formations?.reduce((sum: number, form: any) => sum + (form.improvements?.length || 0), 0) || 0;
    const competencesCount = improvements.competences?.reduce((sum: number, comp: any) => sum + (comp.improvements?.length || 0), 0) || 0;
    const suggestedCount = improvements.suggestedCompetences?.length || 0;
    return experiencesCount + formationsCount + competencesCount + suggestedCount;
  }

  private countCriticalIssues(improvements: any): number {
    const countInSection = (sections: any[]) =>
      sections?.reduce((sum: number, section: any) =>
        sum + (section.improvements?.filter((imp: any) => imp.impact === 'fort' && (imp.type === 'orthographe' || imp.type === 'structure')).length || 0), 0) || 0;
    return countInSection(improvements.experiences) + countInSection(improvements.formations) + countInSection(improvements.competences);
  }

  private countEnhancementSuggestions(improvements: any): number {
    const countInSection = (sections: any[]) =>
      sections?.reduce((sum: number, section: any) =>
        sum + (section.improvements?.filter((imp: any) => imp.type === 'reformulation' || imp.type === 'mots-cles').length || 0), 0) || 0;
    return countInSection(improvements.experiences) + countInSection(improvements.formations) + countInSection(improvements.competences);
  }

  private countAtsKeywords(improvements: any): number {
    const countInSection = (sections: any[]) =>
      sections?.reduce((sum: number, section: any) =>
        sum + (section.improvements?.filter((imp: any) => imp.type === 'mots-cles').length || 0), 0) || 0;
    return countInSection(improvements.experiences) + countInSection(improvements.formations) + countInSection(improvements.competences) + (improvements.suggestedCompetences?.length || 0);
  }
}