// functions/src/callOpenAi.ts
import { HttpsOptions, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineString } from "firebase-functions/params"; // Pour la clé API
import fetch from "node-fetch"; // Ou fetch global si Node 20+ est stable dans ton env.

// Définition du paramètre pour la clé API OpenAI
const openAIKeyParam = defineString("OPENAI_API_KEY");

const functionOptions: HttpsOptions = {
  region: "europe-west1", // Garde la même région que tes autres fonctions
  timeoutSeconds: 180,
  memory: "512MiB",
};

export const callOpenAi = onCall(functionOptions, async (request) => {
  if (!request.auth) { // Vérification d'authentification
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

  // Récupère la valeur de la clé API depuis les paramètres configurés
  const apiKey = openAIKeyParam.value();

  if (!apiKey) {
    logger.error("La clé API OpenAI n'est pas configurée dans les paramètres de la fonction.", { uid: request.auth.uid, structuredData: true });
    throw new HttpsError("internal", "Configuration de la clé API OpenAI manquante.");
  }

  logger.info(`Appel à OpenAI API par utilisateur ${request.auth.uid} avec prompt (début): ${prompt.substring(0, 100)}...`, { structuredData: true });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Tu pourras changer de modèle plus tard si besoin
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000, // Ajuste selon tes besoins
        temperature: 0.7, // Ajuste pour plus ou moins de créativité
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Erreur OpenAI API: ${response.status} ${response.statusText}`, { errorBody: errorText, uid: request.auth.uid, structuredData: true });
      throw new HttpsError("internal", `Erreur de l'API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any; // Typage plus précis possible

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
    if (error instanceof HttpsError) throw error; // Ne pas ré-encapsuler une HttpsError
    if (error instanceof Error) errorMessage = error.message;
    throw new HttpsError("internal", errorMessage);
  }
});