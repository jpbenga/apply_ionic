import { Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc, serverTimestamp, DocumentReference } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from '../models/user-profile.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly usersCollectionPath = 'users';

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) { }

  getUserProfile(): Observable<UserProfile | undefined> {
    const user = this.auth.currentUser;
    if (!user) {
      return of(undefined);
    }
    const userDocRef = doc(this.firestore, `${this.usersCollectionPath}/${user.uid}`) as DocumentReference<UserProfile>;
    return docData<UserProfile>(userDocRef, { idField: 'id' });
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non authentifié.');
    }
    const userDocRef = doc(this.firestore, `${this.usersCollectionPath}/${user.uid}`);
    const dataToSave: Partial<UserProfile> = {
      ...profileData,
      userId: user.uid,
      email: user.email || profileData.email, // Conserve l'email de l'auth si possible
      updatedAt: serverTimestamp() 
    };
    return setDoc(userDocRef, dataToSave, { merge: true });
  }

  async createUserProfile(profileData: UserProfile): Promise<void> {
    const user = this.auth.currentUser;
     if (!user && !profileData.userId) { // S'assurer qu'on a un UID
      throw new Error('UID utilisateur manquant pour la création du profil.');
    }
    const userIdToUse = user ? user.uid : profileData.userId;
    const userDocRef = doc(this.firestore, `${this.usersCollectionPath}/${userIdToUse}`);
    const dataToSave: UserProfile = {
        ...profileData,
        userId: userIdToUse,
        email: user?.email || profileData.email,
        createdAt: serverTimestamp(), // Ajouté pour la création
        updatedAt: serverTimestamp()
    };
    return setDoc(userDocRef, dataToSave, { merge: false }); // merge: false pour une vraie création
  }
}