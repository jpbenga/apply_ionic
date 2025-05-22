export const getAtsAnalysisPrompt = (jobOfferText: string, cvText: string): string => {
    return `
  CONTEXTE : Tu es un assistant expert en recrutement. Tu dois analyser la correspondance entre un CV et une offre d'emploi, et extraire le titre du poste et le nom de l'entreprise.
  
  OFFRE D'EMPLOI :
  \`\`\`
  ${jobOfferText}
  \`\`\`
  
  CV :
  \`\`\`
  ${cvText}
  \`\`\`
  
  INSTRUCTIONS :
  1.  **EXTRACTION :** Sur les DEUX PREMIÈRES LIGNES de ta réponse, indique :
      TITRE_POSTE: [Le titre exact du poste tel qu'indiqué dans l'offre]
      ENTREPRISE: [Le nom exact de l'entreprise tel qu'indiqué dans l'offre]
      (Si l'un ou l'autre n'est pas clairement identifiable, écris "Non trouvé")
  2.  **ANALYSE ATS :** Ensuite, sur les lignes suivantes, analyse la pertinence du CV pour l'offre. Réponds en utilisant le format suivant strictement :
      **1. Compétences Clés de l'Offre Présentes dans le CV :**
      [Liste concise des compétences ou expériences mentionnées dans l'offre ET retrouvées explicitement ou implicitement dans le CV]
      **2. Compétences Clés de l'Offre Manquantes dans le CV :**
      [Liste concise des compétences ou exigences importantes de l'offre qui NE sont PAS clairement mentionnées dans le CV]
      **3. Évaluation Générale :**
      [Donne une évaluation globale TRES COURTE (1 phrase maximum) de l'adéquation du CV pour le poste, par exemple : "Bonne adéquation", "Adéquation moyenne, manque X", "Faible adéquation"]
  Sois objectif et base-toi uniquement sur les textes fournis. Ne donne pas de conseils sur comment améliorer le CV.
  `;
  };