import { Injectable } from '@angular/core';
import * as mammoth from 'mammoth'; // Importation de mammoth

@Injectable({
  providedIn: 'root'
})
export class AIService {

  constructor() { }

  async extractTextFromDocx(file: File): Promise<string> {
    if (!file) {
      return Promise.reject('Aucun fichier fourni.');
    }

    // Vérification du type MIME pour s'assurer que c'est un DOCX
    // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' est le type MIME pour .docx
    // 'application/msword' est pour les anciens .doc (mammoth peut avoir des limitations avec les .doc)
    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Optionnel : tu peux essayer de le traiter quand même ou rejeter
      console.warn(`Type de fichier non optimal pour mammoth: ${file.type}. Tentative de traitement.`);
      // return Promise.reject('Type de fichier non supporté pour l\'extraction DOCX côté client.');
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        if (reader.result instanceof ArrayBuffer) {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
            resolve(result.value); // Le texte extrait
          } catch (error) {
            console.error('Erreur d\'extraction Mammoth:', error);
            reject('Erreur lors de l\'extraction du texte du fichier DOCX.');
          }
        } else {
          reject('Erreur de lecture du fichier.');
        }
      };

      reader.onerror = () => {
        console.error('Erreur FileReader:', reader.error);
        reject('Erreur lors de la lecture du fichier.');
      };

      reader.readAsArrayBuffer(file);
    });
  }
}