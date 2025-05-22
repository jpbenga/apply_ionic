import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  collectionData, 
  Timestamp, 
  query, 
  where,
  docData,
  DocumentReference,
  arrayUnion
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Candidature, SuiviCandidature } from 'src/app/models/candidature.model';
import { StorageService } from '../storage/storage.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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

    if (cvFileToUpload && (!cvOriginalUrl || (cvOriginalNom && cvFileToUpload.name !== cvOriginalNom) || !cvOriginalUrl?.includes('candidatures_cvs')) ) {
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

  getCandidatureById(id: string): Observable<Candidature | undefined> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('Utilisateur non authentifié pour getCandidatureById');
      return of(undefined);
    }
    const candidatureDocRef = doc(this.firestore, `${this.basePath}/${id}`) as DocumentReference<Candidature>;
    return docData<Candidature>(candidatureDocRef, { idField: 'id' }).pipe(
      map(candidature => {
        if (candidature && candidature.userId === user.uid) {
          return candidature;
        } else if (candidature) {
          console.warn('Tentative d\'accès non autorisé ou candidature invalide (userId manquant ou différent). ID:', id);
          return undefined; 
        }
        return undefined;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération de la candidature par ID:', error);
        return of(undefined);
      })
    );
  }

  updateCandidature(id: string, data: Partial<Candidature>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return Promise.reject('Utilisateur non authentifié.');
    }
    const candidatureDocRef = doc(this.firestore, `${this.basePath}/${id}`);
    return updateDoc(candidatureDocRef, {...data, updatedAt: serverTimestamp()});
  }

  deleteCandidature(id: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return Promise.reject('Utilisateur non authentifié.');
    }
    const candidatureDocRef = doc(this.firestore, `${this.basePath}/${id}`);
    return deleteDoc(candidatureDocRef);
  }

  async addSuiviToCandidature(candidatureId: string, suiviItemData: Omit<SuiviCandidature, 'id' | 'date'>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    if (!candidatureId) {
      throw new Error('ID de candidature non fourni.');
    }

    const candidatureDocRef = doc(this.firestore, `${this.basePath}/${candidatureId}`);
    
    const nouveauSuivi: SuiviCandidature = {
      ...suiviItemData,
      id: doc(collection(this.firestore, '_')).id, 
      date: Timestamp.now() 
    };

    try {
      await updateDoc(candidatureDocRef, {
        suivi: arrayUnion(nouveauSuivi),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du suivi à la candidature:', error);
      throw error;
    }
  }
}