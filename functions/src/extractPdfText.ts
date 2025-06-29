/**
 * Firebase Cloud Function to extract text from a PDF file.
 * Expects a file URL (typically a Firebase Storage URL) pointing to a .pdf file
 * passed in `request.data.pdfUrl`. Optionally, `request.data.fileName` can be provided for logging.
 * The function downloads the file, extracts text content using pdf-parse, and returns it
 * along with the page count.
 *
 * @param {object} request The data object passed to the function.
 * @param {string} request.data.pdfUrl The URL of the PDF file to process.
 * @param {string} [request.data.fileName] Optional: The name of the file, used for logging.
 * @returns {Promise<{success: boolean, text?: string, pageCount?: number, message?: string, info?: any}>}
 *          An object indicating success or failure. On success, includes the extracted `text`,
 *          `pageCount`, and optionally PDF `info`. On failure, includes a `message`.
 * @throws {HttpsError} Throws an HttpsError for authentication failures, invalid arguments,
 *                      download failures, or internal errors during PDF parsing.
 */
import { HttpsOptions, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import fetch from "node-fetch"; // Gardons node-fetch@2 pour la simplicité avec les buffers
import pdf from "pdf-parse"; // Importation de pdf-parse

const functionOptions: HttpsOptions = {
  region: "europe-west1",
  timeoutSeconds: 180, // Le parsing PDF peut prendre du temps
  memory: "512MiB",   // Peut nécessiter moins que pdfjs-dist, à ajuster
};

export const extractPdfText = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    logger.error("Appel non authentifié à extractPdfText.", { structuredData: true });
    throw new HttpsError(
      "unauthenticated",
      "La fonction doit être appelée par un utilisateur authentifié."
    );
  }

  const pdfUrl = request.data.pdfUrl as string;
  const fileName = (request.data.fileName as string) || "unnamed.pdf";

  if (!pdfUrl || typeof pdfUrl !== "string") {
    logger.error("Argument pdfUrl manquant ou invalide pour extractPdfText.", { uid: request.auth.uid, data: request.data, structuredData: true });
    throw new HttpsError(
      "invalid-argument",
      "La fonction doit être appelée avec le paramètre 'pdfUrl' (chaîne de caractères)."
    );
  }

  logger.info(
    `Début extraction PDF avec pdf-parse pour ${fileName} par ${request.auth.uid}. URL: ${pdfUrl}`, { structuredData: true }
  );

  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      logger.error(
        `Échec téléchargement PDF: ${response.status} ${response.statusText}`,
        { pdfUrl, uid: request.auth.uid, structuredData: true }
      );
      throw new HttpsError(
        "unavailable",
        `Échec du téléchargement du PDF: ${response.status}`
      );
    }

    const pdfBuffer = await response.buffer(); // node-fetch@2 retourne un Buffer directement
    logger.info("PDF téléchargé et converti en buffer.", { fileName, uid: request.auth.uid, structuredData: true });

    const data = await pdf(pdfBuffer);

    logger.info(`Extraction PDF (pdf-parse) terminée pour ${fileName}. ${data.numpages} pages traitées.`, { uid: request.auth.uid, structuredData: true });

    return {
      success: true,
      text: data.text, // Texte extrait
      pageCount: data.numpages, // Nombre de pages
      info: data.info, // Métadonnées du PDF (optionnel)
    };

  } catch (error: any) {
    logger.error("Erreur durant extraction PDF avec pdf-parse:", { message: error.message, stack: error.stack, fileName, uid: request.auth.uid, structuredData: true });
    let errorMessage = "Erreur inconnue durant extraction PDF avec pdf-parse.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    throw new HttpsError("internal", errorMessage, {
      originalErrorName: error.name, originalErrorMessage: error.message
    });
  }
});