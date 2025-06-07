import { GeneratedCv } from 'src/app/models/cv-template.model';

export const getStructuredCvImprovementPrompt = (jobOfferText: string, cvData: GeneratedCv): string => {
    return `
CONTEXTE : Tu es un expert en recrutement et optimisation de CV. Analyse les données structurées du CV ci-dessous par rapport à l'offre d'emploi et propose des améliorations précises pour chaque section.

OFFRE D'EMPLOI :
\`\`\`
${jobOfferText}
\`\`\`

DONNÉES CV STRUCTURÉES :
\`\`\`
EXPÉRIENCES :
${JSON.stringify(cvData.data.experiences, null, 2)}

FORMATIONS :
${JSON.stringify(cvData.data.formations, null, 2)}

COMPÉTENCES :
${JSON.stringify(cvData.data.competences, null, 2)}
\`\`\`

INSTRUCTIONS :
1. **ANALYSE PAR SECTION** : Examine chaque expérience, formation et compétence individuellement
2. **AMÉLIORE PAR CHAMP** : Propose des améliorations pour poste, entreprise, description, etc.
3. **DÉTECTE** : Orthographe, formulations faibles, manque de quantification, mots-clés ATS manquants
4. **SUGGÈRE** : Nouvelles compétences à ajouter basées sur l'offre d'emploi

**IMPORTANT** : Réponds UNIQUEMENT avec un JSON valide dans ce format exact :

{
  "improvements": {
    "experiences": [
      {
        "id": "exp_improvement_1",
        "sectionType": "experience",
        "itemIndex": 0,
        "itemTitle": "Titre descriptif de l'expérience",
        "improvements": [
          {
            "id": "exp_field_1",
            "type": "orthographe|reformulation|mots-cles|structure|ajout",
            "field": "poste|entreprise|description|lieu",
            "titre": "Titre court de l'amélioration",
            "originalValue": "Valeur actuelle exacte",
            "improvedValue": "Valeur améliorée proposée",
            "explication": "Justification de l'amélioration",
            "impact": "faible|moyen|fort"
          }
        ]
      }
    ],
    "formations": [
      {
        "id": "form_improvement_1",
        "sectionType": "formation",
        "itemIndex": 0,
        "itemTitle": "Titre descriptif de la formation",
        "improvements": [
          {
            "id": "form_field_1",
            "type": "orthographe|reformulation|mots-cles|structure|ajout",
            "field": "diplome|etablissement|description|ville",
            "titre": "Titre court de l'amélioration",
            "originalValue": "Valeur actuelle exacte",
            "improvedValue": "Valeur améliorée proposée",
            "explication": "Justification de l'amélioration",
            "impact": "faible|moyen|fort"
          }
        ]
      }
    ],
    "competences": [
      {
        "id": "comp_improvement_1",
        "sectionType": "competence",
        "itemIndex": 0,
        "itemTitle": "Nom de la compétence",
        "improvements": [
          {
            "id": "comp_field_1",
            "type": "orthographe|reformulation|mots-cles|structure|ajout",
            "field": "nom|categorie",
            "titre": "Titre court de l'amélioration",
            "originalValue": "Valeur actuelle exacte",
            "improvedValue": "Valeur améliorée proposée",
            "explication": "Justification de l'amélioration",
            "impact": "faible|moyen|fort"
          }
        ]
      }
    ],
    "suggestedCompetences": [
      {
        "id": "new_comp_1",
        "nom": "Nouvelle compétence",
        "categorie": "Catégorie appropriée",
        "raison": "Pourquoi cette compétence est importante pour le poste",
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

**CRITÈRES D'AMÉLIORATION** :

**EXPÉRIENCES :**
- **Poste** : Corriger orthographe, utiliser titre plus précis/valorisant
- **Entreprise** : Vérifier orthographe, ajouter secteur si pertinent
- **Description** : Quantifier résultats, ajouter mots-clés techniques, verbes d'action
- **Lieu** : Standardiser format, corriger si nécessaire

**FORMATIONS :**
- **Diplôme** : Orthographe, titre officiel complet
- **Établissement** : Nom exact, prestige si pertinent
- **Description** : Spécialisation, mentions, projets pertinents

**COMPÉTENCES :**
- **Nom** : Orthographe, terminologie standard du secteur
- **Catégorie** : Regroupement logique et cohérent

**NOUVELLES COMPÉTENCES :**
- Identifier mots-clés techniques de l'offre absents du CV
- Proposer compétences transversales pertinentes
- Grouper par catégories logiques

**RÈGLES :**
- Maximum 2-3 améliorations par élément pour rester gérable
- Priorise impact fort (orthographe, mots-clés ATS, quantification)
- originalValue doit être EXACTEMENT la valeur actuelle
- improvedValue doit être directement utilisable
- Propose max 5 nouvelles compétences vraiment pertinentes

Ne produis que le JSON, rien d'autre.
`;
};