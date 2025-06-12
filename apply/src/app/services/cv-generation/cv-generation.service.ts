// src/app/services/cv-generation.service.ts
import { Injectable } from '@angular/core';
import { 
  Firestore, collection, addDoc, updateDoc, deleteDoc, 
  query, orderBy, doc, docData, collectionData 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of, combineLatest } from 'rxjs';
import { map, first, catchError } from 'rxjs/operators';
import { CvData, GeneratedCv, CvTheme } from 'src/app/models/cv-template.model';
import { CvDataService } from '../cv-data/cv-data.service';
import { ProfileService } from '../../features/profile/services/profile.service';

@Injectable({
  providedIn: 'root'
})
export class CvGenerationService {
  private readonly generatedCvsPath = 'generated_cvs';
  private isSaving = false; // Protection contre les appels multiples

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
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des données CV:', error);
        return of(null);
      })
    );
  }

  // Sauvegarde un CV généré - VERSION CORRIGÉE
  async saveGeneratedCv(templateId: string, theme: CvTheme): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié.');

    // Protection contre les appels multiples
    if (this.isSaving) {
      throw new Error('Une sauvegarde de CV est déjà en cours. Veuillez patienter.');
    }

    this.isSaving = true;

    try {
      console.log('🔄 Début de sauvegarde CV:', { templateId, theme });

      // Récupérer les données CV (une seule fois)
      const cvData = await this.getCvData().pipe(
        first(),
        catchError(error => {
          console.error('Erreur getCvData:', error);
          return of(null);
        })
      ).toPromise();
      
      if (!cvData) {
        throw new Error('Aucune donnée CV disponible');
      }

      const hasData = cvData.experiences.length > 0 || 
                     cvData.formations.length > 0 || 
                     cvData.competences.length > 0;

      if (!hasData) {
        throw new Error('Aucune donnée suffisante pour générer un CV');
      }

      // Vérifier s'il existe déjà un CV similaire
      const existingCvs = await this.getGeneratedCvs().pipe(
        first(),
        catchError(error => {
          console.error('Erreur getGeneratedCvs:', error);
          return of([]);
        })
      ).toPromise();

      const existingCv = this.findSimilarCv(existingCvs || [], templateId, theme, cvData);

      if (existingCv) {
        console.log('✅ CV similaire trouvé, réutilisation:', existingCv.id);
        return existingCv.id;
      }

      // Créer un nouveau CV
      const generatedCvsCollectionRef = this.getUserSubcollectionRef();
      
      const dataToSave: Omit<GeneratedCv, 'id'> = {
        userId: user.uid,
        templateId,
        theme,
        data: { ...cvData, templateId, theme },
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(generatedCvsCollectionRef, dataToSave);
      console.log('✅ Nouveau CV créé avec succès:', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du CV:', error);
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  // Trouve un CV similaire pour éviter les doublons
  private findSimilarCv(cvs: GeneratedCv[], templateId: string, theme: CvTheme, currentData: CvData): GeneratedCv | null {
    return cvs.find(cv => {
      // Vérifier template et thème
      const sameTemplate = cv.templateId === templateId;
      const sameTheme = cv.theme.primaryColor === theme.primaryColor;
      
      if (!sameTemplate || !sameTheme) return false;

      // Vérifier si les données sont similaires (pas identiques pour permettre de petites modifications)
      const dataAge = new Date().getTime() - new Date(cv.createdAt).getTime();
      const isRecent = dataAge < 60000; // 1 minute

      // Si le CV a moins d'1 minute, considérer comme similaire
      if (isRecent) {
        console.log('CV récent trouvé (< 1min):', cv.id);
        return true;
      }

      // Sinon, comparer les données de base
      return this.areDatasSimilar(cv.data, currentData);
    }) || null;
  }

  // Compare si deux jeux de données CV sont similaires
  private areDatasSimilar(data1: CvData, data2: CvData): boolean {
    try {
      // Comparer le nombre d'éléments
      const exp1Count = data1.experiences?.length || 0;
      const exp2Count = data2.experiences?.length || 0;
      const form1Count = data1.formations?.length || 0;
      const form2Count = data2.formations?.length || 0;
      const comp1Count = data1.competences?.length || 0;
      const comp2Count = data2.competences?.length || 0;

      return exp1Count === exp2Count && 
             form1Count === form2Count && 
             comp1Count === comp2Count;
    } catch (error) {
      console.error('Erreur lors de la comparaison des données:', error);
      return false;
    }
  }

  // Récupère les CVs générés par l'utilisateur
  getGeneratedCvs(): Observable<GeneratedCv[]> {
    try {
      const generatedCvsCollectionRef = this.getUserSubcollectionRef();
      const q = query(generatedCvsCollectionRef, orderBy('createdAt', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<GeneratedCv[]>;
    } catch (error) {
      console.error("Erreur getGeneratedCvs:", error);
      return of([]);
    }
  }

  // Supprime un CV généré
  async deleteGeneratedCv(cvId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !cvId) throw new Error('Utilisateur non authentifié ou ID de CV manquant.');
    
    try {
      const cvDocRef = doc(this.firestore, `users/${user.uid}/${this.generatedCvsPath}/${cvId}`);
      await deleteDoc(cvDocRef);
      console.log('✅ CV supprimé:', cvId);
    } catch (error) {
      console.error('❌ Erreur suppression CV:', error);
      throw error;
    }
  }

  // Met à jour un CV généré
  async updateGeneratedCv(cvId: string, updates: Partial<GeneratedCv>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !cvId) throw new Error('Utilisateur non authentifié ou ID de CV manquant.');
    
    try {
      const cvDocRef = doc(this.firestore, `users/${user.uid}/${this.generatedCvsPath}/${cvId}`);
      const updateData = { ...updates, updatedAt: new Date().toISOString() };
      await updateDoc(cvDocRef, updateData);
      console.log('✅ CV mis à jour:', cvId);
    } catch (error) {
      console.error('❌ Erreur mise à jour CV:', error);
      throw error;
    }
  }

  // Nettoie les CVs en double (méthode utilitaire)
  async cleanupDuplicateCvs(): Promise<{ deleted: number; kept: number }> {
    try {
      console.log('🧹 Début du nettoyage des doublons...');
      
      const cvs = await this.getGeneratedCvs().pipe(first()).toPromise();
      if (!cvs || cvs.length <= 1) {
        console.log('✅ Aucun doublon à nettoyer');
        return { deleted: 0, kept: cvs?.length || 0 };
      }

      // Grouper par templateId + couleur
      const groups = cvs.reduce((acc, cv) => {
        const key = `${cv.templateId}-${cv.theme.primaryColor}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(cv);
        return acc;
      }, {} as Record<string, GeneratedCv[]>);

      let deletedCount = 0;
      let keptCount = 0;

      // Supprimer les doublons (garder le plus récent)
      for (const group of Object.values(groups)) {
        if (group.length > 1) {
          // Trier par date de création (plus récent en premier)
          group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // Garder le premier (le plus récent)
          keptCount++;
          
          // Supprimer tous les autres
          for (let i = 1; i < group.length; i++) {
            await this.deleteGeneratedCv(group[i].id!);
            deletedCount++;
          }
        } else {
          keptCount++;
        }
      }

      console.log(`✅ Nettoyage terminé: ${deletedCount} supprimés, ${keptCount} conservés`);
      return { deleted: deletedCount, kept: keptCount };

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des doublons:', error);
      throw error;
    }
  }

  // Vérifie l'état du service
  isSavingCv(): boolean {
    return this.isSaving;
  }

  // Force le reset du verrou de sauvegarde (en cas de problème)
  resetSavingState(): void {
    console.log('🔓 Reset du verrou de sauvegarde');
    this.isSaving = false;
  }
  // Méthode à ajouter dans cv-generation.service.ts

  // Génère et télécharge un CV en PDF
  async downloadCvAsPdf(cvId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !cvId) throw new Error('Utilisateur non authentifié ou ID de CV manquant.');
    
    try {
      console.log('📄 Début génération PDF pour CV:', cvId);

      // Récupérer le CV spécifique
      const cvs = await this.getGeneratedCvs().pipe(first()).toPromise();
      const cv = cvs?.find(c => c.id === cvId);
      
      if (!cv) {
        throw new Error('CV non trouvé');
      }

      // Récupérer le profil utilisateur
      const profile = await this.getUserProfile().pipe(first()).toPromise();
      
      if (!profile) {
        throw new Error('Profil utilisateur non trouvé');
      }

      // Générer le nom de fichier
      const fileName = this.generateFileName(profile, cv);
      
      // Ici vous pouvez implémenter la génération PDF
      // Option 1: Utiliser une API backend
      // const pdfBlob = await this.generatePdfViaApi(cv, profile);
      
      // Option 2: Utiliser html2pdf côté client (recommandé pour commencer)
      console.log('✅ CV prêt pour téléchargement:', fileName);
      
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw error;
    }
  }

  // Génère un nom de fichier pour le CV
  private generateFileName(profile: any, cv: GeneratedCv): string {
    const date = new Date().toISOString().split('T')[0];
    const templateName = cv.templateId;
    
    let baseName = 'CV';
    if (profile.firstName && profile.lastName) {
      baseName = `CV_${profile.firstName}_${profile.lastName}`;
    } else if (profile.firstName) {
      baseName = `CV_${profile.firstName}`;
    }
    
    return `${baseName}_${templateName}_${date}.pdf`;
  }

  // Méthode utilitaire pour récupérer un CV spécifique
  async getCvById(cvId: string): Promise<GeneratedCv | null> {
    try {
      const cvs = await this.getGeneratedCvs().pipe(first()).toPromise();
      return cvs?.find(cv => cv.id === cvId) || null;
    } catch (error) {
      console.error('Erreur récupération CV par ID:', error);
      return null;
    }
  }
}