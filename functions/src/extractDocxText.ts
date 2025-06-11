/**
 * Firebase Cloud Function to extract text from a DOCX file.
 * Expects a file URL (typically a Firebase Storage URL) pointing to a .docx file
 * passed in `request.data.docxUrl`. Optionally, `request.data.fileName` can be provided for logging.
 * The function downloads the file, extracts raw text content using mammoth.js, and returns it.
 *
 * @param {object} request The data object passed to the function.
 * @param {string} request.data.docxUrl The URL of the DOCX file to process.
 * @param {string} [request.data.fileName] Optional: The name of the file, used for logging.
 * @returns {Promise<{success: boolean, text?: string, message?: string}>}
 *          An object indicating success or failure. On success, includes the extracted `text`.
 *          On failure, includes a `message` detailing the error.
 * @throws {HttpsError} Throws an HttpsError for authentication failures, invalid arguments,
 *                      or internal errors during processing.
 */
import { HttpsOptions, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as mammoth from "mammoth";
import axios from "axios";

const functionOptions: HttpsOptions = {
  region: "europe-west1",
  // Increase timeout for file download and processing, e.g., to 60 seconds
  timeoutSeconds: 60,
  // Potentially adjust memory if DOCX files are large, e.g., 512MB
  // memory: "512MiB",
};

export const extractDocxText = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    logger.error("Appel non authentifié à extractDocxText.", { structuredData: true });
    throw new HttpsError(
      "unauthenticated",
      "La fonction doit être appelée par un utilisateur authentifié."
    );
  }

  const { docxUrl, fileName } = request.data;

  if (!docxUrl || typeof docxUrl !== 'string') {
    logger.error("URL du fichier DOCX manquante ou invalide.", { uid: request.auth.uid, data: request.data, structuredData: true });
    throw new HttpsError("invalid-argument", "L'URL du fichier DOCX (docxUrl) est requise.");
  }

  logger.info(`Fonction extractDocxText appelée pour le fichier : ${fileName || 'non spécifié'}`, { uid: request.auth.uid, docxUrl, structuredData: true });

  try {
    // 1. Télécharger le fichier DOCX depuis l'URL fournie
    logger.info(`Téléchargement du fichier DOCX depuis: ${docxUrl}`, { uid: request.auth.uid, structuredData: true });
    const response = await axios.get(docxUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);
    logger.info(`Fichier DOCX téléchargé avec succès (taille: ${fileBuffer.length} bytes).`, { uid: request.auth.uid, structuredData: true });

    // 2. Extraire le texte brut du buffer avec Mammoth
    logger.info("Extraction du texte avec Mammoth...", { uid: request.auth.uid, structuredData: true });
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value; // Le texte brut extrait
    // const messages = result.messages; // Peut contenir des avertissements ou des erreurs de Mammoth

    // if (messages && messages.length > 0) {
    //   messages.forEach(message => logger.warn(`Message de Mammoth: ${message.type} - ${message.message}`, { uid: request.auth.uid, structuredData: true }));
    // }

    logger.info(`Texte extrait avec succès (longueur: ${text.length}).`, { uid: request.auth.uid, fileName, structuredData: true });
    return { success: true, text: text };

  } catch (error: any) {
    logger.error("Erreur lors de l'extraction du texte du DOCX:", {
      uid: request.auth.uid,
      fileName,
      docxUrl,
      error: error.message,
      stack: error.stack,
      structuredData: true
    });

    if (axios.isAxiosError(error)) {
      throw new HttpsError("internal", `Erreur lors du téléchargement du fichier DOCX: ${error.message}`);
    } else if (error.name === 'UnsupportedFileTypeError') { // Erreur spécifique de Mammoth
       throw new HttpsError("invalid-argument", "Le fichier fourni n'est pas un type DOCX supporté.");
    } else {
      throw new HttpsError("internal", `Erreur interne lors de l'extraction du texte: ${error.message}`);
    }
  }
});
