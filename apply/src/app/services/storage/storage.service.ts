import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
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
}