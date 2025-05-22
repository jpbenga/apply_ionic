export const getCoverLetterPrompt = (jobOfferText: string, cvText: string): string => {
    return `
  CONTEXTE: Tu es un assistant de rédaction expert. Rédige une lettre de motivation professionnelle et convaincante pour le poste décrit dans l'offre d'emploi ci-dessous, en te basant STRICTEMENT sur les informations contenues dans le CV fourni.
  
  OFFRE D'EMPLOI :
  \`\`\`
  ${jobOfferText}
  \`\`\`
  
  CV DU CANDIDAT :
  \`\`\`
  ${cvText}
  \`\`\`
  
  INSTRUCTIONS SPÉCIFIQUES :
  1.  **Ton et Style :** Adopte un ton professionnel, positif et adapté au secteur d'activité implicite de l'offre.
  2.  **Structure :** Commence par une introduction mentionnant le poste visé et où l'offre a été vue (si possible, sinon omets ce détail). Développe ensuite 1 ou 2 paragraphes mettant en avant les expériences/compétences du CV les plus pertinentes pour l'offre. Termine par une conclusion exprimant l'enthousiasme et proposant une rencontre.
  3.  **Contenu :** Ne mentionne QUE des informations présentes dans le CV. Ne brode pas, n'invente pas de compétences. Mets en valeur les points forts du CV qui correspondent aux exigences de l'offre.
  4.  **Salutation :** Utilise une formule de politesse standard (ex: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.") si le nom du recruteur n'est pas connu.
  5.  **Format :** Produis uniquement le texte de la lettre, sans introduction ou commentaire supplémentaire de ta part.
  6.  **IMPORTANT :** Rédige TOUTE la lettre à la première personne du singulier ("Je", "Mon expérience", "Je serais ravi", etc.).
  
  Rédige la lettre maintenant.
  `;
  };