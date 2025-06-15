import { Injectable } from '@angular/core';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
import { StorageService } from '../storage/storage.service'; // MODIFIED

interface ExtractionResponse {
  success: boolean;
  text?: string;
  message?: string;
  // Adding pageCount for PDF response consistency, though not strictly used by this service directly
  pageCount?: number;
}

/**
 * Service responsible for extracting text from files using cloud functions.
 * It handles both PDF and DOCX files by uploading them to Firebase Storage
 * and then calling the appropriate Firebase Function for text extraction.
 */
@Injectable({
  providedIn: 'root'
})
export class FileExtractionService {

  constructor(
    private functions: Functions,
    private storageService: StorageService
  ) { }

  /**
   * Extracts raw text content from a given PDF or DOCX file.
   * The file is first uploaded to a temporary location in Firebase Storage (`temp_extractions/`),
   * then the appropriate Firebase Function (extractPdfText or extractDocxText) is called
   * with the file URL and name.
   *
   * @param file The PDF or DOCX file object to process.
   * @returns A Promise that resolves with the extracted text content as a string.
   * @throws Error if no file is provided.
   * @throws Error if the file type is not supported (i.e., not PDF or DOCX).
   * @throws Error if the file upload to Firebase Storage fails.
   * @throws Error if the Firebase Function call fails or the function returns an error (e.g., extraction failure).
   */
  async extractTextFromFile(file: File): Promise<string> {
    if (!file) {
      throw new Error('Aucun fichier fourni.');
    }

    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isDocx && !isPdf) {
      // Lancer une erreur plus spécifique pour le type de fichier
      throw new Error(`Type de fichier non supporté (${file.type || 'inconnu'}). Seuls les PDF et DOCX sont acceptés.`);
    }

    let fileUrl: string;
    const filePath = `temp_extractions/${Date.now()}_${file.name}`; // Ajout d'un timestamp pour unicité

    try {
      // 1. Upload vers Firebase Storage
      fileUrl = await this.storageService.uploadFile(file, filePath);
    } catch (uploadError: any) {
      console.error('FileExtractionService: Erreur d\'upload:', uploadError);
      throw new Error(`Échec de l'upload du fichier : ${uploadError.message || 'Erreur inconnue'}`);
    }

    try {
      // 2. Appel de la fonction Firebase appropriée
      let extractFn: any; // Type HttpsCallable<unknown, unknown>
      const payload: { fileName: string; fileUrl?: string; docxUrl?: string; pdfUrl?: string; } =
        { fileName: file.name, fileUrl: fileUrl }; // fileUrl est commun, spécifique ci-dessous

      if (isDocx) {
        extractFn = httpsCallable(this.functions, 'extractDocxText');
        payload.docxUrl = fileUrl; // Spécifique pour la fonction extractDocxText
      } else { // isPdf
        extractFn = httpsCallable(this.functions, 'extractPdfText');
        payload.pdfUrl = fileUrl; // Spécifique pour la fonction extractPdfText
      }

      const result = await extractFn(payload) as HttpsCallableResult;
      const data = result.data as ExtractionResponse;

      if (data.success && typeof data.text === 'string') {
        return data.text;
      } else {
        console.error('FileExtractionService: La fonction d\'extraction a retourné un échec ou pas de texte:', data);
        throw new Error(data.message || "Erreur lors de l'extraction du texte par la fonction.");
      }
    } catch (functionError: any) {
      console.error('FileExtractionService: Erreur appel fonction:', {
        message: functionError.message,
        code: functionError.code,
        details: functionError.details,
        fileUrl: fileUrl,
        fileName: file.name
      });

      // Essayer de supprimer le fichier uploadé en cas d'erreur d'extraction pour nettoyer Storage
      try {
        await this.storageService.deleteFile(fileUrl); // Utiliser fileUrl qui contient le chemin complet
        console.log('FileExtractionService: Fichier temporaire supprimé de Storage après erreur.', fileUrl);
      } catch (deleteError: any) {
        console.error('FileExtractionService: Échec de la suppression du fichier temporaire après erreur:', {
          message: deleteError.message,
          originalFileUrl: fileUrl
        });
      }
      throw new Error(`Échec de l'extraction du texte : ${functionError.message || 'Erreur inconnue lors de l\'appel de la fonction cloud.'}`);
    }
  }
}
