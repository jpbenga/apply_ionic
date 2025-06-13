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
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service'; // <-- IMPORTATION

@Injectable({
  providedIn: 'root'
})
export class CvGenerationService {
  private readonly generatedCvsPath = 'generated_cvs';
  private isSaving = false;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private cvDataService: CvDataService,
    private profileService: ProfileService,
    private pdfGeneratorService: PdfGeneratorService // <-- INJECTION
  ) { }

  private getUserSubcollectionRef() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    return collection(this.firestore, `users/${user.uid}/${this.generatedCvsPath}`);
  }

  getUserProfile(): Observable<any> {
    return this.profileService.getUserProfile();
  }

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

  async saveGeneratedCv(templateId: string, theme: CvTheme): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié.');

    if (this.isSaving) {
      throw new Error('Une sauvegarde de CV est déjà en cours. Veuillez patienter.');
    }

    this.isSaving = true;

    try {
      console.log('🔄 Début de sauvegarde CV:', { templateId, theme });

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

  private findSimilarCv(cvs: GeneratedCv[], templateId: string, theme: CvTheme, currentData: CvData): GeneratedCv | null {
    return cvs.find(cv => {
      const sameTemplate = cv.templateId === templateId;
      const sameTheme = cv.theme.primaryColor === theme.primaryColor;
      
      if (!sameTemplate || !sameTheme) return false;

      const dataAge = new Date().getTime() - new Date(cv.createdAt).getTime();
      const isRecent = dataAge < 60000;

      if (isRecent) {
        console.log('CV récent trouvé (< 1min):', cv.id);
        return true;
      }

      return this.areDatasSimilar(cv.data, currentData);
    }) || null;
  }

  private areDatasSimilar(data1: CvData, data2: CvData): boolean {
    try {
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

  async cleanupDuplicateCvs(): Promise<{ deleted: number; kept: number }> {
    try {
      console.log('🧹 Début du nettoyage des doublons...');
      
      const cvs = await this.getGeneratedCvs().pipe(first()).toPromise();
      if (!cvs || cvs.length <= 1) {
        console.log('✅ Aucun doublon à nettoyer');
        return { deleted: 0, kept: cvs?.length || 0 };
      }

      const groups = cvs.reduce((acc, cv) => {
        const key = `${cv.templateId}-${cv.theme.primaryColor}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(cv);
        return acc;
      }, {} as Record<string, GeneratedCv[]>);

      let deletedCount = 0;
      let keptCount = 0;

      for (const group of Object.values(groups)) {
        if (group.length > 1) {
          group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          keptCount++;
          
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

  // *** MÉTHODE CORRIGÉE ***
  async downloadCvAsPdf(cvId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !cvId) throw new Error('Utilisateur non authentifié ou ID de CV manquant.');

    console.log('📄 Début de la demande de génération PDF pour CV:', cvId);

    // Déclarer l'élément ici pour qu'il soit accessible dans le bloc `finally`
    let tempElement: HTMLElement | null = null;

    try {
      const cv = await this.getCvById(cvId);
      if (!cv) {
        throw new Error('CV non trouvé');
      }

      const profile = await this.getUserProfile().pipe(first()).toPromise();
      if (!profile) {
        throw new Error('Profil utilisateur non trouvé');
      }

      // 1. Créer l'élément HTML du CV à partir des données
      tempElement = this.createOptimizedCvElement(cv, profile);
      document.body.appendChild(tempElement);
      
      // 2. Laisser au navigateur un court instant pour rendre l'élément avant de continuer
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. Valider que l'élément est bien visible avant de lancer la génération
      const validation = this.pdfGeneratorService.validateElement(tempElement);
      if (!validation.valid) {
        console.error('Erreurs de validation de l_élément:', validation.errors);
        throw new Error(`L'élément du CV n'est pas valide pour la génération PDF: ${validation.errors.join(', ')}`);
      }

      // 4. Générer le nom de fichier
      const fileName = this.generateFileName(profile, cv);

      // 5. Déléguer la génération au service spécialisé
      await this.pdfGeneratorService.generateOptimizedPdf(tempElement, {
        filename: fileName,
        singlePage: true,
      });

    } catch (error) {
      console.error('❌ Erreur finale lors de la génération du PDF:', error);
      throw error;
    } finally {
      // 6. S'assurer de toujours nettoyer l'élément temporaire du DOM
      if (tempElement && document.body.contains(tempElement)) {
        document.body.removeChild(tempElement);
        console.log('🧹 Élément temporaire du CV nettoyé.');
      }
    }
  }

  // CRÉATION D'UN ÉLÉMENT CV OPTIMISÉ POUR PDF
  private createOptimizedCvElement(cv: GeneratedCv, profile: any): HTMLElement {
    const element = document.createElement('div');
    // Appliquer un ID unique pour le débogage si nécessaire
    element.id = `cv-temp-render-${Date.now()}`;
    element.style.cssText = `
      width: 794px;
      height: 1123px;
      background: white;
      font-family: 'Arial', sans-serif;
      font-size: 11px;
      line-height: 1.3;
      color: #333;
      padding: 30px;
      box-sizing: border-box;
      position: absolute;
      top: -9999px;
      left: -9999px;
      overflow: hidden;
    `;

    element.innerHTML = this.generateOptimizedCvHtml(cv, profile);
    return element;
  }

  // GÉNÉRATION HTML OPTIMISÉE POUR PDF
  private generateOptimizedCvHtml(cv: GeneratedCv, profile: any): string {
    const data = cv.data;
    const theme = cv.theme;
    const primaryColor = theme.primaryColor || '#007bff';

    return `
      <style>
        .cv-pdf { height: 100%; display: flex; flex-direction: column; }
        .cv-header { background: ${primaryColor}; color: white; padding: 15px; margin: -30px -30px 20px -30px; }
        .cv-name { font-size: 20px; font-weight: bold; margin: 0 0 5px 0; }
        .cv-title { font-size: 12px; margin: 0 0 10px 0; opacity: 0.9; }
        .cv-contact { display: flex; flex-wrap: wrap; gap: 15px; font-size: 10px; }
        .cv-section { margin-bottom: 15px; }
        .cv-section-title { font-size: 13px; font-weight: bold; color: ${primaryColor}; margin: 0 0 8px 0; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        .cv-item { margin-bottom: 8px; page-break-inside: avoid; }
        .cv-item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
        .cv-item-title { font-weight: bold; font-size: 11px; }
        .cv-item-company { font-size: 10px; color: #666; }
        .cv-item-dates { font-size: 9px; color: #999; white-space: nowrap; }
        .cv-item-location { font-size: 9px; color: #666; font-style: italic; }
        .cv-item-description { font-size: 10px; margin-top: 3px; line-height: 1.2; }
        .cv-skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .cv-skill-category { flex: 1; min-width: 150px; }
        .cv-skill-category-title { font-weight: bold; font-size: 10px; margin: 0 0 3px 0; color: ${primaryColor}; }
        .cv-skill-list { font-size: 9px; line-height: 1.2; }
      </style>
      <div class="cv-pdf">
        <div class="cv-header">
          <div class="cv-name">${this.getFullName(profile)}</div>
          <div class="cv-title">${profile?.resumePersonnel || 'Professionnel'}</div>
          <div class="cv-contact">
            ${profile?.email ? `<span>✉ ${profile.email}</span>` : ''}
            ${profile?.telephone ? `<span>📞 ${profile.telephone}</span>` : ''}
            ${profile?.adresse ? `<span>📍 ${profile.adresse}</span>` : ''}
          </div>
        </div>
        ${data.experiences && data.experiences.length > 0 ? `
          <div class="cv-section">
            <h2 class="cv-section-title">Expérience Professionnelle</h2>
            ${data.experiences.map(exp => `
              <div class="cv-item">
                <div class="cv-item-header"><div><div class="cv-item-title">${exp.poste}</div><div class="cv-item-company">${exp.entreprise}</div></div><div class="cv-item-dates">${this.formatDateForPdf(exp.dateDebut)} - ${exp.enCours ? 'Présent' : this.formatDateForPdf(exp.dateFin)}</div></div>
                ${exp.lieu ? `<div class="cv-item-location">${exp.lieu}</div>` : ''}
                ${exp.description ? `<div class="cv-item-description">${exp.description}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}
        ${data.formations && data.formations.length > 0 ? `
          <div class="cv-section">
            <h2 class="cv-section-title">Formation</h2>
            ${data.formations.map(form => `
              <div class="cv-item">
                <div class="cv-item-header"><div><div class="cv-item-title">${form.diplome}</div><div class="cv-item-company">${form.etablissement}</div></div><div class="cv-item-dates">${this.formatDateForPdf(form.dateDebut)} - ${form.enCours ? 'Présent' : this.formatDateForPdf(form.dateFin)}</div></div>
                ${form.ville ? `<div class="cv-item-location">${form.ville}</div>` : ''}
                ${form.description ? `<div class="cv-item-description">${form.description}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}
        ${data.competences && data.competences.length > 0 ? `
          <div class="cv-section">
            <h2 class="cv-section-title">Compétences</h2>
            <div class="cv-skills">
              ${this.getSkillsByCategoryForPdf(data.competences).map(category => `
                <div class="cv-skill-category"><div class="cv-skill-category-title">${category.name}</div><div class="cv-skill-list">${category.skills.map(skill => skill.nom).join(', ')}</div></div>`).join('')}
            </div>
          </div>` : ''}
      </div>
    `;
  }

  private getFullName(profile: any): string {
    if (!profile) return 'Nom Prénom';
    return `${profile.prenom || ''} ${profile.nom || ''}`.trim() || 'Nom Prénom';
  }

  private formatDateForPdf(date: any): string {
    if (!date) return '';
    
    try {
      const d = date && typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  }

  private getSkillsByCategoryForPdf(competences: any[]): Array<{name: string, skills: any[]}> {
    if (!competences) return [];
    
    const categorized = competences.reduce((acc, skill) => {
      const category = skill.categorie || 'Autres';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as {[key: string]: any[]});

    return Object.keys(categorized).map(name => ({
      name,
      skills: categorized[name]
    }));
  }

  private generateFileName(profile: any, cv: GeneratedCv): string {
    const date = new Date().toISOString().split('T')[0];
    const templateName = cv.templateId;
    
    let baseName = 'CV';
    if (profile.prenom && profile.nom) {
      baseName = `CV_${profile.prenom}_${profile.nom}`;
    } else if (profile.prenom) {
      baseName = `CV_${profile.prenom}`;
    }
    
    return `${baseName}_${templateName}_${date}.pdf`;
  }

  async getCvById(cvId: string): Promise<GeneratedCv | null> {
    try {
      const cvs = await this.getGeneratedCvs().pipe(first()).toPromise();
      return cvs?.find(cv => cv.id === cvId) || null;
    } catch (error) {
      console.error('Erreur récupération CV par ID:', error);
      return null;
    }
  }

  isSavingCv(): boolean {
    return this.isSaving;
  }

  resetSavingState(): void {
    console.log('🔓 Reset du verrou de sauvegarde');
    this.isSaving = false;
  }
}