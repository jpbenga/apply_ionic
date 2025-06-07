// src/app/services/ai/prompts/cv-structured-improvement.prompt.ts
import { GeneratedCv } from 'src/app/models/cv-template.model';

export function getStructuredCvImprovementPrompt(jobOfferText: string, cvData: GeneratedCv): string {
  const cvDataJson = JSON.stringify(cvData.data, null, 2);
  
  return `Tu es un expert en optimisation de CV et en recrutement. Analyse ce CV structuré par rapport à cette offre d'emploi et suggère des améliorations PRÉCISES pour maximiser les chances de passage des systèmes ATS et d'attirer les recruteurs.

**OFFRE D'EMPLOI :**
${jobOfferText}

**CV STRUCTURÉ (format JSON) :**
${cvDataJson}

**INSTRUCTIONS :**
1. Analyse chaque section du CV (expériences, formations, compétences)
2. Pour chaque élément, identifie les améliorations possibles sur les champs spécifiques
3. Suggère de NOUVELLES compétences clés manquantes qui correspondent à l'offre
4. Fournis des améliorations concrètes et applicables

**FORMAT DE RÉPONSE (JSON STRICT) :**
{
  "improvements": {
    "experiences": [
      {
        "id": "exp_0",
        "sectionType": "experience",
        "itemIndex": 0,
        "itemId": "id_si_disponible",
        "itemTitle": "Titre du poste - Entreprise",
        "improvements": [
          {
            "id": "exp_0_improve_1",
            "type": "mots-cles|reformulation|orthographe|structure",
            "field": "poste|entreprise|description|lieu",
            "titre": "Titre court de l'amélioration",
            "originalValue": "Valeur actuelle du champ",
            "improvedValue": "Valeur améliorée proposée",
            "explication": "Pourquoi cette amélioration est importante",
            "impact": "faible|moyen|fort"
          }
        ]
      }
    ],
    "formations": [
      {
        "id": "form_0",
        "sectionType": "formation", 
        "itemIndex": 0,
        "itemId": "id_si_disponible",
        "itemTitle": "Diplôme - Établissement",
        "improvements": [
          {
            "id": "form_0_improve_1",
            "type": "mots-cles|reformulation|orthographe|structure",
            "field": "diplome|etablissement|description|ville",
            "titre": "Titre court de l'amélioration",
            "originalValue": "Valeur actuelle",
            "improvedValue": "Valeur améliorée",
            "explication": "Justification de l'amélioration",
            "impact": "faible|moyen|fort"
          }
        ]
      }
    ],
    "competences": [
      {
        "id": "comp_0",
        "sectionType": "competence",
        "itemIndex": 0, 
        "itemId": "id_si_disponible",
        "itemTitle": "Nom de la compétence",
        "improvements": [
          {
            "id": "comp_0_improve_1",
            "type": "reformulation|mots-cles",
            "field": "nom|categorie",
            "titre": "Titre de l'amélioration",
            "originalValue": "Valeur actuelle",
            "improvedValue": "Valeur améliorée", 
            "explication": "Pourquoi cette amélioration",
            "impact": "faible|moyen|fort"
          }
        ]
      }
    ],
    "suggestedCompetences": [
      {
        "id": "new_comp_1",
        "nom": "Nom de la nouvelle compétence",
        "categorie": "Technique|Soft Skills|Outils|Langues|Autre",
        "raison": "Pourquoi cette compétence est importante pour ce poste",
        "impact": "faible|moyen|fort"
      }
    ]
  },
  "summary": {
    "totalSuggestions": 0,
    "criticalIssues": 0,
    "enhancementSuggestions": 0,
    "newCompetencesSuggested": 0,
    "atsKeywordsIntegrated": 0
  }
}

**RÈGLES IMPORTANTES :**
- Chaque amélioration doit être ACTIONNABLE et SPÉCIFIQUE
- Utilise les mots-clés EXACTS de l'offre d'emploi quand pertinent
- Privilégie les améliorations avec impact "fort" pour les éléments critiques
- Les nouvelles compétences doivent être directement liées à l'offre
- Si aucune amélioration n'est nécessaire pour une section, laisse le tableau vide []
- Assure-toi que les indexes correspondent aux positions dans les tableaux
- Les types d'amélioration :
  - "orthographe" : Correction de fautes
  - "reformulation" : Amélioration de la formulation
  - "mots-cles" : Ajout de mots-clés ATS
  - "structure" : Amélioration de la structure/organisation

**RÉPONSE JSON UNIQUEMENT (PAS DE TEXTE AVANT OU APRÈS) :**`;
}