import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  Timestamp 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { StorageService } from 'src/app/shared/services/storage/storage.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

export interface CvDocument {
  id?: string;
  userId: string;
  nom: string;
  fichierUrl: string;
  texteExtrait: string;
  dateCreation: Timestamp;
  dateModification: Timestamp;
  tailleFichier?: number;
  typeFichier: 'pdf' | 'docx';
}

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private readonly basePath = 'cvs';

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private storageService: StorageService
  ) { }

  /**
   * Récupère tous les CVs de l'utilisateur courant
   */
  getCvs(): Observable<CvDocument[]> {
    const user = this.auth.currentUser;
    if (!user) {
      return of([]);
    }

    const cvsCollectionRef = collection(this.firestore, this.basePath);
    const q = query(
      cvsCollectionRef, 
      where('userId', '==', user.uid),
      orderBy('dateCreation', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<CvDocument[]>;
  }

  /**
   * Récupère le CV le plus récent de l'utilisateur
   */
  getMostRecentCv(): Observable<CvDocument | null> {
    const user = this.auth.currentUser;
    if (!user) {
      return of(null);
    }

    const cvsCollectionRef = collection(this.firestore, this.basePath);
    const q = query(
      cvsCollectionRef,
      where('userId', '==', user.uid),
      orderBy('dateCreation', 'desc'),
      limit(1)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((cvs: any[]) => cvs.length > 0 ? cvs[0] as CvDocument : null)
    );
  }

  /**
   * Sauvegarde un nouveau CV
   */
  async saveCv(
    nom: string, 
    fichier: File, 
    texteExtrait: string
  ): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }

    try {
      // Upload du fichier
      const fichierUrl = await this.storageService.uploadFile(
        fichier, 
        `cvs/${user.uid}`
      );

      // Déterminer le type de fichier
      const typeFichier: 'pdf' | 'docx' = fichier.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';

      // Données à sauvegarder
      const cvData: Omit<CvDocument, 'id'> = {
        userId: user.uid,
        nom: nom,
        fichierUrl: fichierUrl,
        texteExtrait: texteExtrait,
        dateCreation: Timestamp.now(),
        dateModification: Timestamp.now(),
        tailleFichier: fichier.size,
        typeFichier: typeFichier
      };

      // Sauvegarde en base
      const docRef = await addDoc(collection(this.firestore, this.basePath), cvData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du CV:', error);
      throw error;
    }
  }

  /**
   * Met à jour un CV existant
   */
  async updateCv(
    cvId: string, 
    data: Partial<Omit<CvDocument, 'id' | 'userId' | 'dateCreation'>>
  ): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }

    const cvDocRef = doc(this.firestore, `${this.basePath}/${cvId}`);
    const updateData = {
      ...data,
      dateModification: serverTimestamp()
    };

    return updateDoc(cvDocRef, updateData);
  }

  /**
   * Supprime un CV
   */
  async deleteCv(cvId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }

    const cvDocRef = doc(this.firestore, `${this.basePath}/${cvId}`);
    return deleteDoc(cvDocRef);
  }

  /**
   * Vérifie s'il existe déjà un CV avec le même nom
   */
  async cvExistsWithName(nom: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) {
      return false;
    }

    const cvsCollectionRef = collection(this.firestore, this.basePath);
    const q = query(
      cvsCollectionRef,
      where('userId', '==', user.uid),
      where('nom', '==', nom)
    );

    try {
      const result = await collectionData(q).pipe(
        take(1),
        map(cvs => cvs.length > 0)
      ).toPromise();
      return result ?? false;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom du CV:', error);
      return false;
    }
  }

  /**
   * Génère un nom unique pour un CV
   */
  async generateUniqueCvName(baseName: string): Promise<string> {
    const cleanBaseName = baseName.replace(/\.(pdf|docx)$/i, '');
    let uniqueName = cleanBaseName;
    let counter = 1;

    while (await this.cvExistsWithName(uniqueName)) {
      uniqueName = `${cleanBaseName} (${counter})`;
      counter++;
    }

    return uniqueName;
  }
}