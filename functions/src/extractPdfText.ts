import { HttpsOptions, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import fetch from "node-fetch";

let pdfjsModule: any;

async function initializePdfJs() {
  if (!pdfjsModule) {
    logger.info("Initialisation de pdfjs-dist (import dynamique)...", { structuredData: true });
    try {
      const lib = await import("pdfjs-dist");
      pdfjsModule = lib; // Assigner directement lib

      if (!pdfjsModule || !pdfjsModule.getDocument || !pdfjsModule.GlobalWorkerOptions) {
        logger.warn("L'import standard de pdfjs-dist semble incomplet, tentative avec legacy/build/pdf.mjs...", { currentModule: pdfjsModule, structuredData: true });
        const legacyLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjsModule = legacyLib; // Assigner directement legacyLib
      }

      if (!pdfjsModule || !pdfjsModule.getDocument || !pdfjsModule.GlobalWorkerOptions) {
        logger.error("Échec du chargement des fonctionnalités essentielles de pdfjs-dist.", { loadedModule: pdfjsModule, structuredData: true });
        throw new Error("pdfjs-dist n'a pas pu être chargé correctement avec getDocument ou GlobalWorkerOptions.");
      }

      let workerSrcPath;
      try {
        workerSrcPath = require.resolve("pdfjs-dist/build/pdf.worker.js");
        logger.info("Utilisation du worker standard: pdfjs-dist/build/pdf.worker.js", { structuredData: true });
      } catch (e) {
        logger.warn("Worker standard (build/pdf.worker.js) non trouvé, tentative avec le worker legacy...", { structuredData: true });
        try {
          workerSrcPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.js");
          logger.info("Utilisation du worker legacy: pdfjs-dist/legacy/build/pdf.worker.js", { structuredData: true });
        } catch (e2) {
          logger.error("Aucun fichier worker pdf.js compatible trouvé.", { error: e2, structuredData: true });
          throw new Error("Fichier worker pdf.js non trouvé.");
        }
      }
      
      pdfjsModule.GlobalWorkerOptions.workerSrc = workerSrcPath;
      logger.info("Worker pdfjs-dist configuré avec : " + workerSrcPath, { structuredData: true });

    } catch (importError) {
      logger.error("Erreur critique lors de l'import dynamique de pdfjs-dist:", importError, { structuredData: true });
      throw new HttpsError("internal", "Erreur d'initialisation du lecteur PDF.", importError);
    }
  }
  return pdfjsModule;
}

const functionOptions: HttpsOptions = {
  region: "europe-west1",
  timeoutSeconds: 180,
  memory: "1GiB",
};

export const extractPdfText = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    logger.error("Appel non authentifié à extractPdfText.", { structuredData: true });
    throw new HttpsError(
      "unauthenticated",
      "La fonction doit être appelée par un utilisateur authentifié."
    );
  }

  const pdfjsLib = await initializePdfJs();

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
    `Début de l'extraction de texte PDF pour ${fileName} par utilisateur ${request.auth.uid}. URL: ${pdfUrl}`, { structuredData: true }
  );

  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      logger.error(
        `Échec du téléchargement du PDF: ${response.status} ${response.statusText}`,
        { pdfUrl, uid: request.auth.uid, structuredData: true }
      );
      throw new HttpsError(
        "unavailable",
        `Échec du téléchargement du PDF depuis l'URL: ${response.status}`
      );
    }
    const pdfBuffer = await response.arrayBuffer();
    logger.info("PDF téléchargé avec succès.", { fileName, uid: request.auth.uid, structuredData: true });

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    logger.info(`PDF chargé avec ${numPages} pages.`, { fileName, uid: request.auth.uid, structuredData: true });

    let fullText = "";
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => (item.str ? item.str : ""))
        .join(" ");
      fullText += pageText + "\n\n";
      page.cleanup();
      if (i % 10 === 0 || i === numPages) {
        logger.info(`Texte de la page ${i}/${numPages} extrait.`, { fileName, uid: request.auth.uid, structuredData: true });
      }
    }

    logger.info(`Extraction de texte PDF terminée pour ${fileName}.`, { uid: request.auth.uid, structuredData: true });
    return {
      success: true,
      text: fullText.trim(),
      pageCount: numPages,
    };
  } catch (error: any) {
    logger.error("Erreur lors de l'extraction du PDF:", error, {
      fileName,
      uid: request.auth.uid,
      structuredData: true,
    });
    let errorMessage = "Erreur inconnue lors de l'extraction du PDF.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    throw new HttpsError("internal", errorMessage, {
      originalError: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });
  }
});