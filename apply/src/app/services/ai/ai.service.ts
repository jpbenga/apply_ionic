import { Injectable } from '@angular/core';
import * as mammoth from 'mammoth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AIService {

  constructor(
    private functions: Functions,
    private storageService: StorageService
  ) { }

  async extractTextFromDocx(file: File): Promise<string> {
    if (!file) {
      return Promise.reject('Aucun fichier fourni.');
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && !file.name.toLowerCase().endsWith('.docx')) {
      console.warn(`AIService: Type de fichier non DOCX (${file.type}) fourni à extractTextFromDocx.`);
      return Promise.reject('Type de fichier non supporté pour l\'extraction DOCX côté client (uniquement .docx).');
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result instanceof ArrayBuffer) {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
            resolve(result.value);
          } catch (error) {
            console.error('AIService: Erreur d\'extraction Mammoth:', error);
            reject('Erreur lors de l\'extraction du texte du fichier DOCX.');
          }
        } else {
          reject('AIService: Erreur de lecture du fichier DOCX (résultat non ArrayBuffer).');
        }
      };
      reader.onerror = () => {
        console.error('AIService: Erreur FileReader pour DOCX:', reader.error);
        reject('Erreur lors de la lecture du fichier DOCX.');
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async getTextFromPdfViaFunction(file: File): Promise<string> {
    if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      throw new Error('AIService: Fichier PDF invalide ou non fourni.');
    }

    try {
      const pdfUrl = await this.storageService.uploadFile(file, 'temp_cv_pdfs_for_extraction');
      
      const extractPdfTextFn = httpsCallable(this.functions, 'extractPdfText');
      const result = await extractPdfTextFn({ pdfUrl: pdfUrl, fileName: file.name });
      
      const data = result.data as { success: boolean; text?: string; pageCount?: number; message?: string };

      if (data.success && typeof data.text === 'string') {
        return data.text;
      } else {
        console.error('AIService: La fonction extractPdfText a retourné un échec ou pas de texte:', data);
        throw new Error(data.message || 'Erreur lors de l\'extraction du texte PDF par la fonction.');
      }
    } catch (error) {
      console.error('AIService: Erreur dans getTextFromPdfViaFunction:', error);
      if (error instanceof Error) {
         throw new Error(`Échec de l'extraction du PDF : ${error.message}`);
      }
      throw new Error('Échec de l\'extraction du PDF : Erreur inconnue.');
    }
  }
}