// src/app/services/cv-generation.service.ts
import { Injectable } from '@angular/core';
import { 
  Firestore, collection, addDoc, updateDoc, deleteDoc, 
  query, orderBy, doc, docData 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CvData, GeneratedCv, CvTheme } from 'src/app/models/cv-template.model';
import { CvDataService } from '../cv-data/cv-data.service';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root'
})
export class CvGenerationService {
  private readonly generatedCvsPath = 'generated_cvs';

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private cvDataService: CvDataService,
    private profileService: ProfileService
  ) { }

  private getUserSubcollectionRef() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    return collection(this.firestore, `users/${user.uid}/${this.generatedCvsPath}`);
  }

  // Récupère le profil utilisateur
  getUserProfile(): Observable<any> {
    return this.profileService.getUserProfile();
  }

  // Récupère toutes les données nécessaires pour générer un CV
  getCvData(): Observable<CvData | null> {
    const user = this.auth.currentUser;
    if (!user) {
      return of(null);
    }

    return combineLatest([
      this.profileService.getUserProfile(),
      this.cvDataService.getExperiences(),
      this.cvDataService.getFormations(),
      this.cvDataService.getCompetences()
    ]).pipe(
      map(([profile, experiences, formations, competences]) => {
        const cvData: CvData = {
          userId: user.uid,
          experiences: experiences || [],
          formations: formations || [],
          competences: competences || [],
          templateId: 'modern',
          theme: { primaryColor: '#007bff' }
        };

        return cvData;
      })
    );
  }

  // Sauvegarde un CV généré
  async saveGeneratedCv(templateId: string, theme: CvTheme): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié.');

    return new Promise((resolve, reject) => {
      this.getCvData().subscribe({
        next: async (cvData) => {
          if (!cvData) {
            reject(new Error('Aucune donnée CV disponible'));
            return;
          }

          const hasData = cvData.experiences.length > 0 || 
                         cvData.formations.length > 0 || 
                         cvData.competences.length > 0;

          if (!hasData) {
            reject(new Error('Aucune donnée suffisante pour générer un CV'));
            return;
          }

          try {
            const generatedCvsCollectionRef = this.getUserSubcollectionRef();
            
            const dataToSave: Omit<GeneratedCv, 'id'> = {
              userId: user.uid,
              templateId,
              theme,
              data: { ...cvData, templateId, theme },
              createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(generatedCvsCollectionRef, dataToSave);
            resolve(docRef.id);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  // Récupère les CVs générés par l'utilisateur
  getGeneratedCvs(): Observable<GeneratedCv[]> {
    try {
      const generatedCvsCollectionRef = this.getUserSubcollectionRef();
      const q = query(generatedCvsCollectionRef, orderBy('createdAt', 'desc'));
      return of([]);
    } catch (error) {
      console.error("Erreur getGeneratedCvs:", error);
      return of([]);
    }
  }

  // Supprime un CV généré
  async deleteGeneratedCv(cvId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !cvId) throw new Error('Utilisateur non authentifié ou ID de CV manquant.');
    
    const cvDocRef = doc(this.firestore, `users/${user.uid}/${this.generatedCvsPath}/${cvId}`);
    return deleteDoc(cvDocRef);
  }

  // Met à jour un CV généré
  async updateGeneratedCv(cvId: string, updates: Partial<GeneratedCv>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !cvId) throw new Error('Utilisateur non authentifié ou ID de CV manquant.');
    
    const cvDocRef = doc(this.firestore, `users/${user.uid}/${this.generatedCvsPath}/${cvId}`);
    return updateDoc(cvDocRef, updates);
  }
}