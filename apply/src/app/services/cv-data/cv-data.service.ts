import { Injectable } from '@angular/core';
import { 
  Firestore, collection, collectionData, doc, addDoc, 
  updateDoc, deleteDoc, query, where, orderBy, Timestamp 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Experience } from 'src/app/models/experience.model';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private readonly experiencesPath = 'experiences';

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) { }

  private getUserSubcollectionRef(subcollectionPath: string) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    return collection(this.firestore, `users/${user.uid}/${subcollectionPath}`);
  }

  getExperiences(): Observable<Experience[]> {
    try {
      const experiencesCollectionRef = this.getUserSubcollectionRef(this.experiencesPath);
      const q = query(experiencesCollectionRef, orderBy('dateDebut', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<Experience[]>;
    } catch (error) {
      console.error("CvDataService: Erreur getExperiences:", error);
      return of([]);
    }
  }

  async addExperience(experienceData: Omit<Experience, 'id' | 'userId'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    const experiencesCollectionRef = this.getUserSubcollectionRef(this.experiencesPath);
    
    const dataToSave: Omit<Experience, 'id'> = {
      ...experienceData,
      userId: user.uid,
      dateDebut: experienceData.dateDebut ? Timestamp.fromDate(new Date(experienceData.dateDebut as string | Date)) : Timestamp.now(),
      dateFin: experienceData.dateFin ? Timestamp.fromDate(new Date(experienceData.dateFin as string | Date)) : null,
    };
    const docRef = await addDoc(experiencesCollectionRef, dataToSave);
    return docRef.id;
  }

  async updateExperience(experienceId: string, experienceData: Partial<Omit<Experience, 'id' | 'userId'>>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !experienceId) {
      throw new Error('Utilisateur non authentifié ou ID d\'expérience manquant.');
    }
    
    const dataToUpdate = { ...experienceData };
    if (dataToUpdate.dateDebut) { 
      dataToUpdate.dateDebut = Timestamp.fromDate(new Date(dataToUpdate.dateDebut as string | Date)); 
    }
    if (dataToUpdate.hasOwnProperty('dateFin')) { 
      dataToUpdate.dateFin = dataToUpdate.dateFin ? Timestamp.fromDate(new Date(dataToUpdate.dateFin as string | Date)) : null;
    }

    const experienceDocRef = doc(this.firestore, `users/${user.uid}/${this.experiencesPath}/${experienceId}`);
    return updateDoc(experienceDocRef, dataToUpdate);
  }

  async deleteExperience(experienceId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !experienceId) {
      throw new Error('Utilisateur non authentifié ou ID d\'expérience manquant.');
    }
    const experienceDocRef = doc(this.firestore, `users/${user.uid}/${this.experiencesPath}/${experienceId}`);
    return deleteDoc(experienceDocRef);
  }
}