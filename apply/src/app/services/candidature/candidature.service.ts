import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, collectionData, Timestamp, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Candidature } from 'src/app/models/candidature.model';
import { StorageService } from '../storage/storage.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private readonly basePath = 'candidatures';

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private storageService: StorageService
  ) { }

  async createCandidature(candidatureData: Omit<Candidature, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'dateCandidature'>, cvFileToUpload?: File | null): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié. Impossible de créer une candidature.');
    }

    let cvOriginalUrl: string | undefined = candidatureData.cvOriginalUrl;
    let cvOriginalNom: string | undefined = candidatureData.cvOriginalNom;

    if (cvFileToUpload && (!cvOriginalUrl || cvFileToUpload.name !== cvOriginalNom) ) {
      try {
        cvOriginalUrl = await this.storageService.uploadFile(cvFileToUpload, `candidatures_cvs/${user.uid}`);
        cvOriginalNom = cvFileToUpload.name;
      } catch (error) {
        console.error('Erreur lors de l\'upload du CV original pour la candidature:', error);
      }
    }

    const dataToSave: Candidature = {
      ...candidatureData,
      userId: user.uid,
      cvOriginalUrl: cvOriginalUrl,
      cvOriginalNom: cvOriginalNom,
      dateCandidature: Timestamp.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(this.firestore, this.basePath), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la candidature dans Firestore:', error);
      throw error;
    }
  }

  getCandidatures(): Observable<Candidature[]> {
    const user = this.auth.currentUser;
    if (!user) {
      return of([]);
    }
    const candidaturesCollection = collection(this.firestore, this.basePath);
    const q = query(candidaturesCollection, where('userId', '==', user.uid));
    return collectionData(q, { idField: 'id' }) as Observable<Candidature[]>;
  }

  updateCandidature(id: string, data: Partial<Candidature>): Promise<void> {
    const candidatureDocRef = doc(this.firestore, `${this.basePath}/${id}`);
    return updateDoc(candidatureDocRef, {...data, updatedAt: serverTimestamp()});
  }

  deleteCandidature(id: string): Promise<void> {
    const candidatureDocRef = doc(this.firestore, `${this.basePath}/${id}`);
    return deleteDoc(candidatureDocRef);
  }
}