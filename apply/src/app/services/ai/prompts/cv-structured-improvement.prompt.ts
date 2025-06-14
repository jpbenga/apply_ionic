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
           "titre": "Reformuler en liste avec mots-clés",
           "originalValue": ["Ancien texte de la description."],
           "improvedValue": [
             "Première mission reformulée avec des verbes d'action.",
             "Deuxième mission intégrant les mots-clés de l'offre.",
             "Troisième mission avec des résultats chiffrés pour plus d'impact."
           ],
           "explication": "La description est transformée en une liste pour plus de clarté.",
           "impact": "fort"
         }
       ]
     }
   ]
 }
}

RÈGLES STRICTES:
- **RÈGLE CAPITALE : Pour le champ "description", la valeur "improvedValue" DOIT TOUJOURS ÊTRE UN TABLEAU DE CHAÎNES DE CARACTÈRES (JSON array of strings), MÊME SI LA DESCRIPTION ORIGINALE EST UN SIMPLE TEXTE.**
- Chaque chaîne du tableau représente un point de la liste (une mission, un détail).
- type: "orthographe", "reformulation", "mots-cles", "structure"
- impact: "faible", "moyen", "fort"
- JSON strict uniquement.`;
}
