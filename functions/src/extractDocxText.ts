import { HttpsOptions, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
// import * as mammoth from "mammoth"; // Si tu implémentes ceci

const functionOptions: HttpsOptions = {
  region: "europe-west1",
  // Ajoute d'autres options
};

export const extractDocxText = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    logger.error("Appel non authentifié à extractDocxText.", { structuredData: true });
    throw new HttpsError(
      "unauthenticated",
      "La fonction doit être appelée par un utilisateur authentifié."
    );
  }

  logger.info("Fonction extractDocxText appelée par utilisateur", { uid: request.auth.uid, data: request.data, structuredData: true });
  // Logique d'extraction DOCX backend à implémenter ici
  return { success: false, message: "Fonction extractDocxText backend non implémentée." };
});