// src/app/services/ai/prompts/cv-structured-improvement.prompt.ts
import { GeneratedCv } from 'src/app/models/cv-template.model';

export function getStructuredCvImprovementPrompt(jobOfferText: string, cvData: GeneratedCv): string {
  const cvDataJson = JSON.stringify(cvData.data, null, 2);
  
  return `Tu es un expert en optimisation de CV. Analyse ce CV par rapport à l'offre d'emploi et propose des améliorations précises.

OFFRE D'EMPLOI:
${jobOfferText}

CV ACTUEL:
${cvDataJson}

IMPORTANT: Réponds UNIQUEMENT en JSON valide. Pas de texte avant/après. Vérifie la syntaxe JSON.

STRUCTURE ATTENDUE:
{
  "improvements": {
    "experiences": [
      {
        "id": "exp_0",
        "sectionType": "experience",
        "itemIndex": 0,
        "itemTitle": "Poste - Entreprise",
        "improvements": [
          {
            "id": "exp_0_improve_1",
            "type": "mots-cles",
            "field": "description",
            "titre": "Ajouter mots-clés ATS",
            "originalValue": "Texte actuel",
            "improvedValue": "Texte avec mots-clés",
            "explication": "Raison de l'amélioration",
            "impact": "fort"
          }
        ]
      }
    ],
    "formations": [],
    "competences": [],
    "suggestedCompetences": [
      {
        "id": "new_comp_1",
        "nom": "React",
        "categorie": "Technique",
        "raison": "Requis dans l'offre",
        "impact": "fort"
      }
    ]
  },
  "summary": {
    "totalSuggestions": 2,
    "criticalIssues": 0,
    "enhancementSuggestions": 1,
    "newCompetencesSuggested": 1,
    "atsKeywordsIntegrated": 1
  }
}

RÈGLES:
- type: "orthographe", "reformulation", "mots-cles", "structure"
- impact: "faible", "moyen", "fort"
- field expériences: "poste", "entreprise", "description", "lieu"
- field formations: "diplome", "etablissement", "description", "ville"
- field compétences: "nom", "categorie"
- Utilise les mots-clés exacts de l'offre
- Si pas d'amélioration pour une section: tableau vide []
- JSON strict uniquement:`;
}