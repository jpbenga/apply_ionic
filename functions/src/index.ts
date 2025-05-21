import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger"; // Import direct du logger v2

if (admin.apps.length === 0) {
  admin.initializeApp();
  logger.info("Firebase Admin SDK initialisé.");
}

export { extractPdfText } from "./extractPdfText";
export { callOpenAi } from "./callOpenAi";
export { extractDocxText } from "./extractDocxText";