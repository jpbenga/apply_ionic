export const getAtsAnalysisPrompt = (jobOfferText: string, cvText: string): string => {
    return `
  CONTEXTE : Tu es un assistant expert en recrutement. Tu dois analyser la correspondance entre un CV et une offre d'emploi, et extraire les informations clés de l'offre.
  
  OFFRE D'EMPLOI :
  \`\`\`
  ${jobOfferText}
  \`\`\`
  
  CV :
  \`\`\`
  ${cvText}
  \`\`\`
  
  INSTRUCTIONS :
  1.  **EXTRACTION JSON :** Analyse l'offre d'emploi et extrais les informations suivantes. Réponds UNIQUEMENT avec un objet JSON valide. Ne fournis aucun texte avant ou après l'objet JSON.
      -   **jobTitle**: Le titre exact du poste. (string | null)
      -   **companyName**: Le nom de l'entreprise. (string | null)
      -   **contactPerson**: Le nom d'une personne de contact si mentionné (ex: "Jean Dupont", "l'équipe RH"). (string | null)
      -   **contactEmail**: Une adresse email de contact si mentionnée. (string | null)
      -   **analysisText**: Une analyse de pertinence du CV pour l'offre, formatée en une seule chaîne de caractères avec des "\\n" pour les sauts de ligne. (string)
  
  2.  **FORMAT DE L'ANALYSE (pour la clé "analysisText") :** Le texte de l'analyse doit suivre cette structure :
      "**1. Compétences Clés de l'Offre Présentes dans le CV :**\\n[Liste concise...]\\n\\n**2. Compétences Clés de l'Offre Manquantes dans le CV :**\\n[Liste concise...]\\n\\n**3. Évaluation Générale :**\\n[Évaluation très courte (1 phrase)]"
  
  3.  **RÈGLES IMPORTANTES :**
      -   Si une information n'est pas clairement identifiable dans l'offre (ex: pas de contact), la valeur du champ correspondant dans le JSON doit être \`null\`.
      -   Sois objectif et base-toi uniquement sur les textes fournis.
      -   Le résultat final doit être un JSON PARFAITEMENT VALIDE.
  
  EXEMPLE DE RÉPONSE JSON ATTENDUE :
  \`\`\`json
  {
    "jobTitle": "Développeur Fullstack Java/Angular",
    "companyName": "TechInnov",
    "contactPerson": "Marie Curie, Responsable recrutement",
    "contactEmail": "recrutement@techinnov.com",
    "analysisText": "**1. Compétences Clés de l'Offre Présentes dans le CV :**\\n- Java, Spring Boot\\n- Angular, TypeScript\\n- API REST\\n\\n**2. Compétences Clés de l'Offre Manquantes dans le CV :**\\n- Expérience avec Docker\\n- Connaissance de AWS\\n\\n**3. Évaluation Générale :**\\nBonne adéquation, le candidat possède les compétences techniques principales."
  }
  \`\`\`
  `;
  };
  