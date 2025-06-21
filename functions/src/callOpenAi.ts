// functions/src/callOpenAi.ts
import { HttpsOptions, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params"; // CHANGEMENT: defineSecret au lieu de defineString

// CHANGEMENT: Utiliser defineSecret pour les données sensibles
const openAIKeySecret = defineSecret("OPENAI_API_KEY");

const functionOptions: HttpsOptions = {
  region: "europe-west1",
  timeoutSeconds: 180,
  memory: "512MiB",
  secrets: [openAIKeySecret], // AJOUT: Nécessaire pour les secrets
};

export const callOpenAi = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    logger.error("Appel non authentifié à callOpenAi.", { structuredData: true });
    throw new HttpsError(
      "unauthenticated",
      "La fonction doit être appelée par un utilisateur authentifié."
    );
  }

  const prompt = request.data.prompt as string;
  if (!prompt || typeof prompt !== "string") {
    logger.error("Prompt manquant ou invalide.", { uid: request.auth.uid, data: request.data, structuredData: true });
    throw new HttpsError("invalid-argument", "La fonction doit être appelée avec un paramètre 'prompt' (chaîne de caractères).");
  }

  // CHANGEMENT: Utiliser .value() pour les secrets
  const apiKey = openAIKeySecret.value();

  if (!apiKey) {
    logger.error("La clé API OpenAI n'est pas configurée dans les secrets de la fonction.", { uid: request.auth.uid, structuredData: true });
    throw new HttpsError("internal", "Configuration de la clé API OpenAI manquante.");
  }

  // Debug log (à supprimer en production)
  logger.info(`Clé API commencée par: ${apiKey.substring(0, 10)}...`, { uid: request.auth.uid, structuredData: true });
  
  logger.info(`Appel à OpenAI API par utilisateur ${request.auth.uid} avec prompt (début): ${prompt.substring(0, 100)}...`, { structuredData: true });

  try {
    // CHANGEMENT: Utiliser fetch global (Node.js 20) au lieu de node-fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Erreur OpenAI API: ${response.status} ${response.statusText}`, { errorBody: errorText, uid: request.auth.uid, structuredData: true });
      throw new HttpsError("internal", `Erreur de l'API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;

    if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      logger.info("Réponse reçue d'OpenAI avec succès.", { uid: request.auth.uid, structuredData: true });
      return {
        success: true,
        response: data.choices[0].message.content,
      };
    } else {
      logger.error("Format de réponse OpenAI inattendu.", { responseData: data, uid: request.auth.uid, structuredData: true });
      throw new HttpsError("internal", "Format de réponse OpenAI inattendu.");
    }
  } catch (error: any) {
    logger.error("Erreur lors de l'appel à OpenAI:", error, { uid: request.auth.uid, structuredData: true });
    let errorMessage = "Échec de l'appel à OpenAI.";
    if (error instanceof HttpsError) throw error;
    if (error instanceof Error) errorMessage = error.message;
    throw new HttpsError("internal", errorMessage);
  }
});