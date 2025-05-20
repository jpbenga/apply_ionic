// src/app/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  authState,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc, getDoc, updateDoc, DocumentReference, DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable de l'utilisateur courant avec Firestore data
  private userSource = new BehaviorSubject<User | null>(null);
  user$ = this.userSource.asObservable();
  
  // Observable pour le chargement du profil utilisateur
  private loadingSource = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSource.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Observer les changements d'état d'authentification
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log('Auth state changed: User is signed in');
        this.userSource.next(user);
      } else {
        console.log('Auth state changed: User is signed out');
        this.userSource.next(null);
      }
    });
  }

  /**
   * Crée un nouvel utilisateur avec email et mot de passe
   */
  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      // Créer l'utilisateur
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = credential.user;
      
      // Mettre à jour le profil
      if (displayName && user) {
        await updateProfile(user, { displayName });
      }
      
      // Essayer de créer le document utilisateur, mais continuer même en cas d'échec
      try {
        await this.createUserDocument(user);
      } catch (firestoreError) {
        console.error('Error creating user document, but authentication successful:', firestoreError);
        // Ne pas propager cette erreur pour permettre l'authentification même si Firestore échoue
      }
      
      return user;
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  }

  /**
   * Connexion avec email et mot de passe
   */
  async signIn(email: string, password: string): Promise<User> {
    this.loadingSource.next(true);
    
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    } finally {
      this.loadingSource.next(false);
    }
  }

  /**
   * Connexion avec Google
   */
  async signInWithGoogle(): Promise<User> {
    this.loadingSource.next(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;
      
      // Vérifier si le document utilisateur existe déjà
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userDocSnap = await getDoc(userDocRef);
      
      // Si le document n'existe pas, le créer
      if (!userDocSnap.exists()) {
        await this.createUserDocument(user);
      }
      
      return user;
    } catch (error) {
      console.error('Error during Google sign in:', error);
      throw error;
    } finally {
      this.loadingSource.next(false);
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  /**
   * Crée un document utilisateur dans Firestore
   */
  private async createUserDocument(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: new Date(),
      lastLogin: new Date(),
      // Ajouter des champs par défaut pour le profil utilisateur
      bio: '',
      phone: '',
      location: '',
      // Initialisation des statistiques
      stats: {
        totalApplications: 0,
        interviews: 0,
        offers: 0,
        rejections: 0,
        streak: 0,
        lastActive: new Date()
      }
    };
    
    try {
      await setDoc(userRef, userData);
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  /**
   * Met à jour le document utilisateur dans Firestore
   */
  async updateUserProfile(userId: string, data: Partial<DocumentData>): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    
    try {
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Récupère les données utilisateur depuis Firestore
   */
  async getUserData(userId: string): Promise<DocumentData | null> {
    const userRef = doc(this.firestore, `users/${userId}`);
    
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log('No user data found!');
        return null;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }
}