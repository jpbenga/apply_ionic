export default function getCvImprovementPrompt(jobOfferText: string, cvText: string): string {
  return `
CONTEXTE : Tu es un expert en recrutement et rédaction de CV. Analyse le CV ci-dessous par rapport à l'offre d'emploi et propose des améliorations précises et concrètes.

OFFRE D'EMPLOI :
\`\`\`
${jobOfferText}
\`\`\`

CV À AMÉLIORER :
\`\`\`
${cvText}
\`\`\`

INSTRUCTIONS :
1. **ANALYSE COMPLÈTE** : Examine chaque section du CV (expériences, formations, compétences, etc.)
2. **DÉTECTE** : Orthographe, grammaire, formulations faibles, mots-clés ATS manquants, structure inadéquate
3. **PROPOSE** : Améliorations concrètes avec justification

**IMPORTANT** : Réponds UNIQUEMENT avec un JSON valide dans ce format exact :

{
"improvements": [
  {
    "id": "unique_id_1",
    "type": "orthographe|reformulation|mots-cles|structure",
    "section": "Nom de la section concernée",
    "titre": "Titre court de l'amélioration",
    "textOriginal": "Texte original exact du CV",
    "textAmeliore": "Version améliorée proposée",
    "explication": "Pourquoi cette amélioration (1-2 phrases)",
    "impact": "faible|moyen|fort"
  }
],
"summary": {
  "totalSuggestions": 0,
  "criticalIssues": 0,
  "enhancementSuggestions": 0,
  "atsKeywords": ["mot-clé1", "mot-clé2"]
}
}

**CRITÈRES D'AMÉLIORATION** :
- **Orthographe/Grammaire** : Corrections indispensables (impact: fort)
- **Reformulation** : Rendre plus impactant, quantifier, clarifier (impact: moyen/fort)
- **Mots-clés ATS** : Intégrer termes de l'offre manquants (impact: fort)
- **Structure** : Améliorer lisibilité, organisation (impact: moyen)

**RÈGLES** :
- Maximum 8 suggestions pour rester gérable
- Priorise les améliorations à fort impact
- textOriginal doit être EXACTEMENT ce qui apparaît dans le CV
- textAmeliore doit être directement utilisable en remplacement
- atsKeywords : liste des mots-clés importants de l'offre absents du CV

Ne produis que le JSON, rien d'autre.
`;
};