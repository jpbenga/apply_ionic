import { Injectable } from '@angular/core';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
// import { StorageService } from '../storage/storage.service'; // SUPPRIMÉ
import { FileExtractionService } from '../../shared/services/file-extraction/file-extraction.service'; // MODIFIED
import { getAtsAnalysisPrompt } from './prompts/ats-analysis.prompt';
import { getCoverLetterPrompt } from './prompts/cover-letter.prompt';
import { getCvImprovementPrompt } from './prompts/cv-improvement.prompt';
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
    // private storageService: StorageService, // SUPPRIMÉ
    private fileExtractionService: FileExtractionService
  ) { }

  // ===================================
  // EXTRACTION DE TEXTE
  // ===================================

  /**
   * Extrait le texte d'un fichier DOCX en utilisant {@link FileExtractionService}.
   * Ce service gère l'upload du fichier et l'appel à la fonction cloud appropriée.
   * @param file Le fichier DOCX à traiter.
   * @returns Une promesse qui se résout avec le texte extrait.
   * @throws Error si aucun fichier n'est fourni ou si l'extraction échoue (via FileExtractionService).
   */
  async extractTextFromDocx(file: File): Promise<string> {
    if (!file) { // Garder une validation de base
      throw new Error('AIService: Aucun fichier DOCX fourni.');
    }
    // La validation de type plus poussée et la logique d'extraction sont dans FileExtractionService
    try {
      return await this.fileExtractionService.extractTextFromFile(file);
    } catch (error) {
      console.error('AIService: Erreur lors de l\'extraction du texte DOCX via FileExtractionService:', error);
      // Propager l'erreur ou la reformater si besoin
      throw error;
    }
  }

  /**
   * Extrait le texte d'un fichier PDF en utilisant {@link FileExtractionService}.
   * Ce service gère l'upload du fichier et l'appel à la fonction cloud appropriée.
   * @param file Le fichier PDF à traiter.
   * @returns Une promesse qui se résout avec le texte extrait.
   * @throws Error si aucun fichier n'est fourni ou si l'extraction échoue (via FileExtractionService).
   */
  async extractTextFromPdf(file: File): Promise<string> { // NOM RENOMMÉ
    if (!file) { // Garder une validation de base
      throw new Error('AIService: Aucun fichier PDF fourni.');
    }
    // La validation de type plus poussée et la logique d'extraction sont dans FileExtractionService
    try {
      return await this.fileExtractionService.extractTextFromFile(file);
    } catch (error) {
      console.error('AIService: Erreur lors de l\'extraction du texte PDF via FileExtractionService:', error);
      // Propager l'erreur ou la reformater si besoin
      throw error;
    }
  }

  // ===================================
  // ANALYSE ATS ET LETTRE DE MOTIVATION
  // ===================================

  /**
   * Génère une analyse ATS à partir d'une offre d'emploi et d'un CV
   */
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

  /**
   * Génère une lettre de motivation personnalisée
   */
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

  // ===================================
  // AMÉLIORATION CV TEXTE (Legacy)
  // ===================================

  /**
   * Améliore un CV en format texte (méthode legacy)
   */
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

  /**
   * Applique les améliorations acceptées sur un texte CV (méthode legacy)
   */
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

  // ===================================
  // AMÉLIORATION CV STRUCTURÉ (Nouveau)
  // ===================================

  /**
   * Améliore un CV structuré (GeneratedCv) par rapport à une offre d'emploi
   */
  async improveStructuredCv(jobOfferText: string, cvData: GeneratedCv): Promise<StructuredCvImprovementResponse> {
    const prompt = getStructuredCvImprovementPrompt(jobOfferText, cvData);
    const callOpenAiFn = httpsCallable(this.functions, 'callOpenAi');

    try {
      console.log('🤖 Envoi de la demande d\'amélioration CV structuré à l\'IA...');
      const result = await callOpenAiFn({ prompt }) as HttpsCallableResult;
      const data = result.data as OpenAIResponse;

      if (data.success && data.response) {
        try {
          // Parse la réponse JSON de l'IA
          const aiResponse = JSON.parse(data.response);
          console.log('📊 Réponse IA reçue:', aiResponse);
          
          // Validation et nettoyage des données avec meilleure gestion d'erreurs
          const improvements = {
            experiences: this.validateSectionImprovements(aiResponse.improvements?.experiences || [], 'experience'),
            formations: this.validateSectionImprovements(aiResponse.improvements?.formations || [], 'formation'),
            competences: this.validateSectionImprovements(aiResponse.improvements?.competences || [], 'competence'),
            suggestedCompetences: this.validateSuggestedCompetences(aiResponse.improvements?.suggestedCompetences || [])
          };

          // Validation du summary avec valeurs par défaut
          const summary = {
            totalSuggestions: aiResponse.summary?.totalSuggestions || this.countTotalSuggestions(improvements),
            criticalIssues: aiResponse.summary?.criticalIssues || this.countCriticalIssues(improvements),
            enhancementSuggestions: aiResponse.summary?.enhancementSuggestions || this.countEnhancementSuggestions(improvements),
            newCompetencesSuggested: aiResponse.summary?.newCompetencesSuggested || improvements.suggestedCompetences.length,
            atsKeywordsIntegrated: aiResponse.summary?.atsKeywordsIntegrated || this.countAtsKeywords(improvements)
          };

          // Log pour debugging en développement
          console.log('📊 Améliorations CV structuré analysées:', {
            totalSuggestions: summary.totalSuggestions,
            sections: {
              experiences: improvements.experiences.length,
              formations: improvements.formations.length,
              competences: improvements.competences.length,
              newCompetences: improvements.suggestedCompetences.length
            }
          });

          return {
            success: true,
            improvements,
            summary
          };
        } catch (parseError) {
          console.error('AIService: Erreur parsing JSON de l\'amélioration CV structuré:', parseError);
          console.log('Réponse brute de l\'IA:', data.response?.substring(0, 500) + '...');
          
          // Fallback avec réponse vide mais valide
          return {
            success: true,
            improvements: {
              experiences: [],
              formations: [],
              competences: [],
              suggestedCompetences: []
            },
            summary: {
              totalSuggestions: 0,
              criticalIssues: 0,
              enhancementSuggestions: 0,
              newCompetencesSuggested: 0,
              atsKeywordsIntegrated: 0
            }
          };
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
    console.log('🔧 Application des améliorations structurées...');
    
    // Clone profond des données originales pour éviter les mutations
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

    try {
      // 1. AMÉLIORATIONS DES EXPÉRIENCES
      console.log('📊 Application des améliorations d\'expériences...');
      improvements.improvements.experiences.forEach(sectionImprovement => {
        const acceptedImprovements = sectionImprovement.improvements.filter(imp => imp.accepted);
        
        if (acceptedImprovements.length > 0) {
          const expIndex = sectionImprovement.itemIndex;
          
          // Vérification de l'existence de l'expérience
          if (expIndex >= 0 && expIndex < improvedData.experiences.length) {
            const experience = improvedData.experiences[expIndex];
            
            acceptedImprovements.forEach(improvement => {
              if (this.isValidExperienceField(improvement.field) && experience) {
                const oldValue = (experience as any)[improvement.field];
                (experience as any)[improvement.field] = improvement.improvedValue;
                changesCount.experiences++;
                
                console.log(`✅ Expérience ${expIndex} - ${improvement.field}: "${oldValue}" → "${improvement.improvedValue}"`);
              }
            });
            
            appliedImprovements.experiences.push({
              ...sectionImprovement,
              improvements: acceptedImprovements
            });
          } else {
            console.warn(`⚠️ Index d'expérience invalide: ${expIndex}`);
          }
        }
      });

      // 2. AMÉLIORATIONS DES FORMATIONS
      console.log('🎓 Application des améliorations de formations...');
      improvements.improvements.formations.forEach(sectionImprovement => {
        const acceptedImprovements = sectionImprovement.improvements.filter(imp => imp.accepted);
        
        if (acceptedImprovements.length > 0) {
          const formIndex = sectionImprovement.itemIndex;
          
          if (formIndex >= 0 && formIndex < improvedData.formations.length) {
            const formation = improvedData.formations[formIndex];
            
            acceptedImprovements.forEach(improvement => {
              if (this.isValidFormationField(improvement.field) && formation) {
                const oldValue = (formation as any)[improvement.field];
                (formation as any)[improvement.field] = improvement.improvedValue;
                changesCount.formations++;
                
                console.log(`✅ Formation ${formIndex} - ${improvement.field}: "${oldValue}" → "${improvement.improvedValue}"`);
              }
            });
            
            appliedImprovements.formations.push({
              ...sectionImprovement,
              improvements: acceptedImprovements
            });
          } else {
            console.warn(`⚠️ Index de formation invalide: ${formIndex}`);
          }
        }
      });

      // 3. AMÉLIORATIONS DES COMPÉTENCES
      console.log('🛠️ Application des améliorations de compétences...');
      improvements.improvements.competences.forEach(sectionImprovement => {
        const acceptedImprovements = sectionImprovement.improvements.filter(imp => imp.accepted);
        
        if (acceptedImprovements.length > 0) {
          const compIndex = sectionImprovement.itemIndex;
          
          if (compIndex >= 0 && compIndex < improvedData.competences.length) {
            const competence = improvedData.competences[compIndex];
            
            acceptedImprovements.forEach(improvement => {
              if (this.isValidCompetenceField(improvement.field) && competence) {
                const oldValue = (competence as any)[improvement.field];
                (competence as any)[improvement.field] = improvement.improvedValue;
                changesCount.competences++;
                
                console.log(`✅ Compétence ${compIndex} - ${improvement.field}: "${oldValue}" → "${improvement.improvedValue}"`);
              }
            });
            
            appliedImprovements.competences.push({
              ...sectionImprovement,
              improvements: acceptedImprovements
            });
          } else {
            console.warn(`⚠️ Index de compétence invalide: ${compIndex}`);
          }
        }
      });

      // 4. AJOUT DES NOUVELLES COMPÉTENCES
      console.log('✨ Ajout des nouvelles compétences...');
      const acceptedNewCompetences = improvements.improvements.suggestedCompetences.filter(comp => comp.accepted);
      
      acceptedNewCompetences.forEach(suggestedComp => {
        const newCompetence: Competence = {
          userId: originalCv.userId,
          nom: suggestedComp.nom,
          categorie: suggestedComp.categorie
          // Note: id sera généré lors de la sauvegarde en base
        };
        
        // Vérifier que la compétence n'existe pas déjà
        const exists = improvedData.competences.some(comp => 
          comp.nom.toLowerCase().trim() === newCompetence.nom.toLowerCase().trim()
        );
        
        if (!exists) {
          improvedData.competences.push(newCompetence);
          appliedImprovements.addedCompetences.push(suggestedComp);
          changesCount.competences++;
          
          console.log(`✅ Nouvelle compétence ajoutée: "${newCompetence.nom}" (${newCompetence.categorie})`);
        } else {
          console.log(`⚠️ Compétence "${newCompetence.nom}" existe déjà, ignorée`);
        }
      });

      // 5. CALCUL DU TOTAL
      changesCount.total = changesCount.experiences + changesCount.formations + changesCount.competences;
      
      console.log('📈 Résumé des améliorations appliquées:', changesCount);

      return {
        originalData,
        improvedData,
        appliedImprovements,
        changesCount
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'application des améliorations:', error);
      
      // En cas d'erreur, retourner les données originales
      return {
        originalData,
        improvedData: originalData, // Pas de changements en cas d'erreur
        appliedImprovements: {
          experiences: [],
          formations: [],
          competences: [],
          addedCompetences: []
        },
        changesCount: { experiences: 0, formations: 0, competences: 0, total: 0 }
      };
    }
  }

  // ===================================
  // MÉTHODES UTILITAIRES PRIVÉES
  // ===================================

  /**
   * Clone profond d'un objet
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Valide les améliorations d'une section
   */
  private validateSectionImprovements(sections: any[], type: string): SectionImprovement[] {
    if (!Array.isArray(sections)) {
      console.warn(`AIService: sections n'est pas un tableau pour ${type}`);
      return [];
    }

    return sections.map((section, index) => {
      // Validation de la structure de section
      const validatedSection: SectionImprovement = {
        id: section.id || `${type}_section_${index}`,
        sectionType: section.sectionType || type,
        itemIndex: typeof section.itemIndex === 'number' ? section.itemIndex : index,
        itemId: section.itemId || undefined,
        itemTitle: section.itemTitle || `${type} ${index + 1}`,
        improvements: []
      };

      // Validation des améliorations
      if (Array.isArray(section.improvements)) {
        validatedSection.improvements = section.improvements.map((imp: any, impIndex: number) => ({
          id: imp.id || `${type}_imp_${index}_${impIndex}`,
          type: this.validateImprovementType(imp.type),
          field: imp.field || 'description',
          titre: imp.titre || 'Amélioration suggérée',
          originalValue: imp.originalValue || '',
          improvedValue: imp.improvedValue || '',
          explication: imp.explication || '',
          impact: this.validateImpact(imp.impact),
          accepted: false
        }));
      }

      return validatedSection;
    }).filter(section => section.improvements.length > 0); // Supprimer les sections sans améliorations
  }

  /**
   * Valide les nouvelles compétences suggérées
   */
  private validateSuggestedCompetences(competences: any[]): SuggestedCompetence[] {
    if (!Array.isArray(competences)) {
      console.warn('AIService: suggestedCompetences n\'est pas un tableau');
      return [];
    }

    return competences.map((comp, index) => ({
      id: comp.id || `new_comp_${index}`,
      nom: comp.nom || `Compétence ${index + 1}`,
      categorie: comp.categorie || 'Autre',
      raison: comp.raison || 'Compétence recommandée pour ce poste',
      impact: this.validateImpact(comp.impact),
      accepted: false
    })).filter(comp => comp.nom.trim() !== ''); // Supprimer les compétences vides
  }

  /**
   * Valide le type d'amélioration
   */
  private validateImprovementType(type: any): string {
    const validTypes = ['orthographe', 'reformulation', 'mots-cles', 'structure', 'ajout'];
    return validTypes.includes(type) ? type : 'reformulation';
  }

  /**
   * Valide l'impact d'une amélioration
   */
  private validateImpact(impact: any): 'faible' | 'moyen' | 'fort' {
    const validImpacts = ['faible', 'moyen', 'fort'];
    return validImpacts.includes(impact) ? impact : 'moyen';
  }

  /**
   * Valide qu'un champ d'expérience est valide
   */
  private isValidExperienceField(field: string): boolean {
    const validFields = ['poste', 'entreprise', 'description', 'lieu'];
    return validFields.includes(field);
  }

  /**
   * Valide qu'un champ de formation est valide
   */
  private isValidFormationField(field: string): boolean {
    const validFields = ['diplome', 'etablissement', 'description', 'ville'];
    return validFields.includes(field);
  }

  /**
   * Valide qu'un champ de compétence est valide
   */
  private isValidCompetenceField(field: string): boolean {
    const validFields = ['nom', 'categorie'];
    return validFields.includes(field);
  }

  // ===================================
  // MÉTHODES DE COMPTAGE
  // ===================================

  /**
   * Compte le nombre total de suggestions
   */
  private countTotalSuggestions(improvements: any): number {
    const experiencesCount = improvements.experiences?.reduce((sum: number, exp: any) => sum + (exp.improvements?.length || 0), 0) || 0;
    const formationsCount = improvements.formations?.reduce((sum: number, form: any) => sum + (form.improvements?.length || 0), 0) || 0;
    const competencesCount = improvements.competences?.reduce((sum: number, comp: any) => sum + (comp.improvements?.length || 0), 0) || 0;
    const suggestedCount = improvements.suggestedCompetences?.length || 0;
    
    return experiencesCount + formationsCount + competencesCount + suggestedCount;
  }

  /**
   * Compte les problèmes critiques
   */
  private countCriticalIssues(improvements: any): number {
    const countInSection = (sections: any[]) => 
      sections?.reduce((sum: number, section: any) => 
        sum + (section.improvements?.filter((imp: any) => imp.impact === 'fort' && (imp.type === 'orthographe' || imp.type === 'structure')).length || 0), 0) || 0;
    
    return countInSection(improvements.experiences) +
           countInSection(improvements.formations) +
           countInSection(improvements.competences);
  }

  /**
   * Compte les suggestions d'amélioration
   */
  private countEnhancementSuggestions(improvements: any): number {
    const countInSection = (sections: any[]) => 
      sections?.reduce((sum: number, section: any) => 
        sum + (section.improvements?.filter((imp: any) => imp.type === 'reformulation' || imp.type === 'mots-cles').length || 0), 0) || 0;
    
    return countInSection(improvements.experiences) +
           countInSection(improvements.formations) +
           countInSection(improvements.competences);
  }

  /**
   * Compte les mots-clés ATS intégrés
   */
  private countAtsKeywords(improvements: any): number {
    const countInSection = (sections: any[]) => 
      sections?.reduce((sum: number, section: any) => 
        sum + (section.improvements?.filter((imp: any) => imp.type === 'mots-cles').length || 0), 0) || 0;
    
    return countInSection(improvements.experiences) +
           countInSection(improvements.formations) +
           countInSection(improvements.competences) +
           (improvements.suggestedCompetences?.length || 0);
  }
}