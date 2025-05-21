import { HttpsOptions, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

const functionOptions: HttpsOptions = {
  region: "europe-west1",
  // Ajoute d'autres options comme timeoutSeconds, memory si nécessaire
};

export const callOpenAi = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    logger.error("Appel non authentifié à callOpenAi.", { structuredData: true });
    throw new HttpsError(
      "unauthenticated",
      "La fonction doit être appelée par un utilisateur authentifié."
    );
  }

  logger.info("Fonction callOpenAi appelée par utilisateur", { uid: request.auth.uid, data: request.data, structuredData: true });
  // Logique d'appel à OpenAI à implémenter ici
  return { success: false, message: "Fonction callOpenAi non implémentée." };
});