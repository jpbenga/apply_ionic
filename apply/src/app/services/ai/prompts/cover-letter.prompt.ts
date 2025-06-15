import { UserProfile } from 'src/app/features/profile/models/user-profile.model';

export const getCoverLetterPrompt = (
    jobOfferText: string,
    cvText: string,
): string => {
    return `
CONTEXTE: Tu es un assistant de rédaction expert. Rédige les paragraphes du corps d'une lettre de motivation professionnelle et convaincante pour le poste décrit ci-dessous, en te basant STRICTEMENT sur les informations du CV.

OFFRE D'EMPLOI :
\`\`\`
${jobOfferText}
\`\`\`

CV DU CANDIDAT :
\`\`\`
${cvText}
\`\`\`

INSTRUCTIONS SPÉCIFIQUES :
1.  **Format :** Produis UNIQUEMENT les paragraphes du corps de la lettre. NE PAS inclure de salutation (comme "Madame, Monsieur,") NI de formule de politesse finale (comme "Veuillez agréer...").
2.  **Contenu :**
    -   Rédige à la première personne ("Je").
    -   Base-toi exclusivement sur les informations fournies dans le CV pour argumenter. N'invente rien.
    -   Mets en avant les expériences et compétences qui correspondent le mieux à l'offre.
    -   Adopte un ton professionnel et positif.
    -   Sépare clairement les paragraphes par un saut de ligne. Chaque paragraphe doit être une unité de sens.

Rédige les paragraphes du corps de la lettre maintenant.
`;
};