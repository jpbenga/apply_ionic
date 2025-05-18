// src/app/services/storage.service.ts
import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) { }

  async uploadFile(path: string, file: File) {
    const storageRef = ref(this.storage, path);
    const result = await uploadBytes(storageRef, file);
    return getDownloadURL(result.ref);
  }

  async deleteFile(path: string) {
    const storageRef = ref(this.storage, path);
    return deleteObject(storageRef);
  }
}