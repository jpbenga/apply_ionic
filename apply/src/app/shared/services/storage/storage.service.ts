import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage'; // AJOUTER deleteObject
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage,
    private auth: Auth
  ) { }

  async uploadFile(file: File, path: string): Promise<string> {
    if (!file) {
      throw new Error('Aucun fichier fourni pour l\'upload.');
    }

    let userIdPath = 'guest_uploads';
    const user = this.auth.currentUser;
    if (user) {
      userIdPath = `user_uploads/${user.uid}`;
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = `${userIdPath}/${path}/${Date.now()}_${safeFileName}`;
    const storageRef = ref(this.storage, fullPath);

    try {
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      return downloadUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier vers Firebase Storage:', error);
      throw error;
    }
  }

  /**
   * Deletes a file from Firebase Storage using its download URL.
   * @param fileUrl The download URL of the file to delete.
   * @returns A Promise that resolves when the file is deleted.
   * @throws Error if the URL is not a valid Firebase Storage URL or if deletion fails.
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) {
      throw new Error('StorageService: No file URL provided for deletion.');
    }
    try {
      // Convertir l'URL de téléchargement en référence de fichier
      // Note: cette conversion peut être fragile si le format de l'URL change.
      // Une approche plus robuste consisterait à stocker le chemin du fichier au lieu de l'URL complète,
      // mais pour l'instant, nous allons travailler avec l'URL.
      const fileRef = ref(this.storage, fileUrl);
      await deleteObject(fileRef);
      console.log('StorageService: File deleted successfully from URL:', fileUrl);
    } catch (error: any) {
      // Gérer les erreurs spécifiques de Firebase si possible (ex: object-not-found)
      if (error.code === 'storage/object-not-found') {
        console.warn('StorageService: File not found for deletion (may have been already deleted):', fileUrl);
        return; // Pas besoin de lever une erreur si le fichier n'existe déjà plus
      }
      console.error('StorageService: Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}