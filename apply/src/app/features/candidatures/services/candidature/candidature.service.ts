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
  arrayUnion,
  orderBy,
  QueryConstraint
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Candidature, SuiviCandidature, StatutCandidature, TypeSuivi } from 'src/app/features/candidatures/models/candidature.model';
import { StorageService } from 'src/app/shared/services/storage/storage.service';
import { Observable, of } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';

export interface GetCandidaturesOptions {
  sortByDate?: 'asc' | 'desc';
  statuts?: StatutCandidature[];
  searchText?: string;
}

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

  /**
 * Créer une nouvelle candidature
 */
async createCandidature(candidatureData: Omit<Candidature, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'dateCandidature'>, cvFileToUpload?: File | null): Promise<string> {
  const user = this.auth.currentUser;
  if (!user) {
    throw new Error('Utilisateur non authentifié. Impossible de créer une candidature.');
  }

  let cvOriginalUrl: string | undefined = candidatureData.cvOriginalUrl;
  let cvOriginalNom: string | undefined = candidatureData.cvOriginalNom;

  // Logique d'upload uniquement si un fichier est fourni
  if (cvFileToUpload && (!cvOriginalUrl || (cvOriginalNom && cvFileToUpload.name !== cvOriginalNom) || !cvOriginalUrl?.includes('candidatures_cvs')) ) {
    try {
      cvOriginalUrl = await this.storageService.uploadFile(cvFileToUpload, `candidatures_cvs/${user.uid}`);
      cvOriginalNom = cvFileToUpload.name;
    } catch (error) {
      console.error('Erreur lors de l\'upload du CV original pour la candidature:', error);
    }
  }

  // Construire les données de base
  const dataToSave: any = {
    ...candidatureData,
    userId: user.uid,
    dateCandidature: Timestamp.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Remplacer les valeurs undefined par null ou les supprimer
  if (cvOriginalUrl !== undefined) {
    dataToSave.cvOriginalUrl = cvOriginalUrl;
  } else {
    delete dataToSave.cvOriginalUrl; // Supprimer le champ s'il est undefined
  }

  if (cvOriginalNom !== undefined) {
    dataToSave.cvOriginalNom = cvOriginalNom;
  } else {
    delete dataToSave.cvOriginalNom; // Supprimer le champ s'il est undefined
  }

  // Nettoyer tous les autres champs undefined
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key];
    }
  });

  try {
    const docRef = await addDoc(collection(this.firestore, this.basePath), dataToSave);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la candidature dans Firestore:', error);
    throw error;
  }
}

  /**
   * Récupérer les candidatures avec options de filtrage
   */
  getCandidatures(options?: GetCandidaturesOptions): Observable<Candidature[]> {
    const user = this.auth.currentUser;
    if (!user) {
      return of([]);
    }

    const candidaturesCollectionRef = collection(this.firestore, this.basePath);
    const queryConstraints: QueryConstraint[] = [where('userId', '==', user.uid)];

    // Tri par date
    if (options?.sortByDate) {
      queryConstraints.push(orderBy('dateCandidature', options.sortByDate));
    } else {
      queryConstraints.push(orderBy('dateCandidature', 'desc'));
    }

    // Filtre par statuts (si spécifié et pas plus de 10 valeurs - limitation Firestore)
    if (options?.statuts && options.statuts.length > 0 && options.statuts.length <= 10) {
      queryConstraints.push(where('statut', 'in', options.statuts));
    }
    
    const q = query(candidaturesCollectionRef, ...queryConstraints);
    
    return (collectionData(q, { idField: 'id' }) as Observable<Candidature[]>).pipe(
      map((candidatures: Candidature[]) => {
        let filteredCandidatures = candidatures;
        
        // Filtre par statuts côté client si plus de 10 statuts
        if (options?.statuts && options.statuts.length > 10) {
          filteredCandidatures = candidatures.filter(candidature => 
            options.statuts!.includes(candidature.statut)
          );
        }
        
        // Filtre par recherche textuelle (côté client pour plus de flexibilité)
        if (options?.searchText && options.searchText.trim() !== '') {
          const searchTerm = options.searchText.toLowerCase().trim();
          filteredCandidatures = filteredCandidatures.filter(candidature => 
            candidature.entreprise?.toLowerCase().includes(searchTerm) ||
            candidature.intitulePoste?.toLowerCase().includes(searchTerm) ||
            candidature.lieuTravail?.toLowerCase().includes(searchTerm)
          );
        }
        
        return filteredCandidatures;
      })
    );
  }

  /**
   * Récupérer une candidature par ID
   */
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

  /**
   * Mettre à jour une candidature
   */
  updateCandidature(id: string, data: Partial<Candidature>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return Promise.reject('Utilisateur non authentifié.');
    }
    const candidatureDocRef = doc(this.firestore, `${this.basePath}/${id}`);
    return updateDoc(candidatureDocRef, {...data, updatedAt: serverTimestamp()});
  }

  /**
   * Supprimer une candidature
   */
  async deleteCandidature(id: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    
    if (!id) {
      throw new Error('ID de candidature non fourni.');
    }

    try {
      // Vérifier d'abord que la candidature appartient bien à l'utilisateur
      const candidature = await this.getCandidatureById(id).pipe(
        first(),
        catchError(() => of(undefined))
      ).toPromise();

      if (!candidature) {
        throw new Error('Candidature non trouvée ou accès non autorisé.');
      }

      // Supprimer la candidature
      const candidatureDocRef = doc(this.firestore, `${this.basePath}/${id}`);
      await deleteDoc(candidatureDocRef);
      
      console.log('Candidature supprimée avec succès:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
      throw error;
    }
  }

  /**
   * Supprimer plusieurs candidatures
   */
  async deleteMultipleCandidatures(candidatureIds: string[]): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    
    if (!candidatureIds || candidatureIds.length === 0) {
      throw new Error('Aucun ID de candidature fourni.');
    }

    const errors: string[] = [];
    const successes: string[] = [];

    // Supprimer chaque candidature individuellement pour maintenir la sécurité
    for (const id of candidatureIds) {
      try {
        await this.deleteCandidature(id);
        successes.push(id);
      } catch (error) {
        console.error(`Erreur lors de la suppression de la candidature ${id}:`, error);
        errors.push(id);
      }
    }

    if (errors.length > 0 && successes.length === 0) {
      throw new Error(`Impossible de supprimer toutes les candidatures sélectionnées.`);
    } else if (errors.length > 0) {
      console.warn(`Certaines candidatures n'ont pas pu être supprimées: ${errors.join(', ')}`);
    }

    console.log(`${successes.length} candidature(s) supprimée(s) avec succès.`);
  }

  /**
   * Ajouter un suivi à une candidature
   */
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

  /**
   * Obtenir les statistiques des candidatures par statut
   */
  getStatistics(): Observable<{ [key in StatutCandidature]: number }> {
    return this.getCandidatures().pipe(
      map(candidatures => {
        const stats: { [key in StatutCandidature]: number } = {
          brouillon: 0,
          envoyee: 0,
          en_cours_rh: 0,
          entretien_planifie: 0,
          test_technique: 0,
          entretien_final: 0,
          offre_recue: 0,
          acceptee: 0,
          refusee_candidat: 0,
          refusee_entreprise: 0,
          archivee: 0,
          standby: 0
        };

        candidatures.forEach(candidature => {
          if (candidature.statut) {
            stats[candidature.statut]++;
          }
        });

        return stats;
      })
    );
  }
}