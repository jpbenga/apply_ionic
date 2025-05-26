import { Injectable } from '@angular/core';
import { 
  Firestore, collection, collectionData, doc, addDoc, 
  updateDoc, deleteDoc, query, orderBy, Timestamp 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';
import { Competence } from 'src/app/models/competence.model';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private readonly experiencesPath = 'experiences';
  private readonly formationsPath = 'formations';
  private readonly competencesPath = 'competences';

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

  private convertToTimestampIfDateOrString(dateValue: Date | string | Timestamp | undefined | null): Timestamp | null {
    if (dateValue instanceof Timestamp) {
      return dateValue;
    }
    if (dateValue instanceof Date) {
      return Timestamp.fromDate(dateValue);
    }
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return Timestamp.fromDate(date);
      }
    }
    return null;
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
    if (!user) throw new Error('Utilisateur non authentifié.');
    const experiencesCollectionRef = this.getUserSubcollectionRef(this.experiencesPath);
    
    const dataForFirestore: any = {
      ...experienceData,
      userId: user.uid,
      dateDebut: this.convertToTimestampIfDateOrString(experienceData.dateDebut) || Timestamp.now(),
      dateFin: experienceData.enCours ? null : this.convertToTimestampIfDateOrString(experienceData.dateFin),
    };
    
    Object.keys(dataForFirestore).forEach(key => 
      (dataForFirestore[key] === undefined) && delete dataForFirestore[key]
    );
    if (dataForFirestore.enCours === true) {
      dataForFirestore.dateFin = null;
    }

    const docRef = await addDoc(experiencesCollectionRef, dataForFirestore);
    return docRef.id;
  }

  async updateExperience(experienceId: string, experienceData: Partial<Omit<Experience, 'id' | 'userId'>>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !experienceId) throw new Error('Utilisateur non authentifié ou ID d\'expérience manquant.');
    
    const dataForFirestore: any = { ...experienceData };

    if (dataForFirestore.hasOwnProperty('dateDebut')) { 
      dataForFirestore.dateDebut = this.convertToTimestampIfDateOrString(dataForFirestore.dateDebut); 
    }
    if (dataForFirestore.hasOwnProperty('dateFin')) { 
      dataForFirestore.dateFin = dataForFirestore.enCours ? null : this.convertToTimestampIfDateOrString(dataForFirestore.dateFin);
    }
    if (dataForFirestore.hasOwnProperty('enCours') && dataForFirestore.enCours === true) {
        dataForFirestore.dateFin = null;
    }
    
    const finalDataToUpdate: any = {};
    Object.keys(dataForFirestore).forEach(key => {
        if (dataForFirestore[key] !== undefined) finalDataToUpdate[key] = dataForFirestore[key];
    });

    const experienceDocRef = doc(this.firestore, `users/${user.uid}/${this.experiencesPath}/${experienceId}`);
    return updateDoc(experienceDocRef, finalDataToUpdate);
  }

  async deleteExperience(experienceId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !experienceId) throw new Error('Utilisateur non authentifié ou ID d\'expérience manquant.');
    const experienceDocRef = doc(this.firestore, `users/${user.uid}/${this.experiencesPath}/${experienceId}`);
    return deleteDoc(experienceDocRef);
  }

  getFormations(): Observable<Formation[]> {
    try {
      const formationsCollectionRef = this.getUserSubcollectionRef(this.formationsPath);
      const q = query(formationsCollectionRef, orderBy('dateDebut', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<Formation[]>;
    } catch (error) {
      console.error("CvDataService: Erreur getFormations:", error);
      return of([]);
    }
  }

  async addFormation(formationData: Omit<Formation, 'id' | 'userId'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié.');
    const formationsCollectionRef = this.getUserSubcollectionRef(this.formationsPath);
    const dataForFirestore: any = {
      ...formationData,
      userId: user.uid,
      dateDebut: this.convertToTimestampIfDateOrString(formationData.dateDebut) || Timestamp.now(),
      dateFin: formationData.enCours ? null : this.convertToTimestampIfDateOrString(formationData.dateFin),
    };
    Object.keys(dataForFirestore).forEach(key => 
      (dataForFirestore[key] === undefined) && delete dataForFirestore[key]
    );
    if (dataForFirestore.enCours === true) {
        dataForFirestore.dateFin = null;
    }
    const docRef = await addDoc(formationsCollectionRef, dataForFirestore);
    return docRef.id;
  }

  async updateFormation(formationId: string, formationData: Partial<Omit<Formation, 'id' | 'userId'>>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !formationId) throw new Error('Utilisateur non authentifié ou ID de formation manquant.');
    const dataForFirestore: any = { ...formationData };

    if (dataForFirestore.hasOwnProperty('dateDebut')) { 
      dataForFirestore.dateDebut = this.convertToTimestampIfDateOrString(dataForFirestore.dateDebut); 
    }
    if (dataForFirestore.hasOwnProperty('dateFin')) { 
      dataForFirestore.dateFin = dataForFirestore.enCours ? null : this.convertToTimestampIfDateOrString(dataForFirestore.dateFin);
    }
     if (dataForFirestore.hasOwnProperty('enCours') && dataForFirestore.enCours === true) {
        dataForFirestore.dateFin = null;
    }

    const finalDataToUpdate: any = {};
    Object.keys(dataForFirestore).forEach(key => {
        if (dataForFirestore[key] !== undefined) finalDataToUpdate[key] = dataForFirestore[key];
    });
    const formationDocRef = doc(this.firestore, `users/${user.uid}/${this.formationsPath}/${formationId}`);
    return updateDoc(formationDocRef, finalDataToUpdate);
  }

  async deleteFormation(formationId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !formationId) throw new Error('Utilisateur non authentifié ou ID de formation manquant.');
    const formationDocRef = doc(this.firestore, `users/${user.uid}/${this.formationsPath}/${formationId}`);
    return deleteDoc(formationDocRef);
  }

  getCompetences(): Observable<Competence[]> {
    try {
      const competencesCollectionRef = this.getUserSubcollectionRef(this.competencesPath);
      const q = query(competencesCollectionRef, orderBy('nom', 'asc'));
      return collectionData(q, { idField: 'id' }) as Observable<Competence[]>;
    } catch (error) {
      console.error("CvDataService: Erreur getCompetences:", error);
      return of([]);
    }
  }

  async addCompetence(competenceData: Omit<Competence, 'id' | 'userId'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié.');
    const competencesCollectionRef = this.getUserSubcollectionRef(this.competencesPath);
    const dataToSave: any = {
      ...competenceData,
      userId: user.uid,
    };
    Object.keys(dataToSave).forEach(key => (dataToSave[key] === undefined) && delete dataToSave[key]);
    const docRef = await addDoc(competencesCollectionRef, dataToSave);
    return docRef.id;
  }

  async updateCompetence(competenceId: string, competenceData: Partial<Omit<Competence, 'id' | 'userId'>>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !competenceId) throw new Error('Utilisateur non authentifié ou ID de compétence manquant.');
    const dataToUpdate: any = { ...competenceData };
    const finalDataToUpdate: any = {};
    Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] !== undefined) finalDataToUpdate[key] = dataToUpdate[key];
    });
    const competenceDocRef = doc(this.firestore, `users/${user.uid}/${this.competencesPath}/${competenceId}`);
    return updateDoc(competenceDocRef, finalDataToUpdate);
  }

  async deleteCompetence(competenceId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !competenceId) throw new Error('Utilisateur non authentifié ou ID de compétence manquant.');
    const competenceDocRef = doc(this.firestore, `users/${user.uid}/${this.competencesPath}/${competenceId}`);
    return deleteDoc(competenceDocRef);
  }
}