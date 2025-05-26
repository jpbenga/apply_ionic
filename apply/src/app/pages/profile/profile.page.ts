import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription, BehaviorSubject } from 'rxjs';
import { first, tap, catchError, finalize } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput,
  IonTextarea, IonButton, IonIcon, IonAvatar, IonSpinner, IonList,
  IonFab, IonFabButton,
  IonModal, IonButtons
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from '@angular/fire/auth';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { ToastController, ModalController } from '@ionic/angular/standalone';
import { StorageService } from 'src/app/services/storage/storage.service';
import { addIcons } from 'ionicons';
import { personCircleOutline, createOutline, saveOutline, close, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput,
    IonTextarea, IonButton, IonIcon, IonAvatar, IonSpinner, IonList,
    IonFab, IonFabButton,
    IonModal, IonButtons,
    UserHeaderComponent
  ]
})
export class ProfilePage implements OnInit, OnDestroy {
  
  private profileSubscription: Subscription | undefined;
  public userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();
  
  currentUserAuth$: Observable<User | null>;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string | null = null;

  isEditModalOpen: boolean = false;
  editableProfileInModal: Partial<UserProfile> = {};
  selectedAvatarFile: File | null = null;
  isUploadingAvatar: boolean = false;
  
  @ViewChild('avatarFileInput') avatarFileInput!: ElementRef<HTMLInputElement>;

  constructor(
    public headerService: HeaderService,
    private profileService: ProfileService,
    private authService: AuthService,
    private toastController: ToastController,
    private modalController: ModalController,
    private storageService: StorageService
  ) {
    this.currentUserAuth$ = this.authService.user$;
    addIcons({ personCircleOutline, createOutline, saveOutline, close, personAddOutline });
  }

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon Profil');
    this.headerService.setShowBackButton(true);
    if (!this.isLoading) {
        this.loadProfileDataIntoEditableFromSubject();
    }
    this.isEditModalOpen = false; 
    this.selectedAvatarFile = null;
  }

  ionViewWillLeave() {
    this.headerService.setShowBackButton(false);
  }
  
  loadProfile() {
    this.isLoading = true;
    this.errorMessage = null;
    this.profileSubscription = this.profileService.getUserProfile().pipe(
      first(),
      tap(profile => {
        if (profile) {
          const profileWithUserId = { ...profile, userId: profile.id || profile.userId };
          this.userProfileSubject.next(profileWithUserId);
        } else {
          this.userProfileSubject.next(null);
          this.editableProfileInModal = {}; 
          this.currentUserAuth$.pipe(first()).subscribe(authUser => {
            if (authUser && authUser.uid && authUser.email && !this.userProfileSubject.value) {
              const newProfileData: UserProfile = {
                userId: authUser.uid,
                email: authUser.email,
                nom: authUser.displayName?.split(' ').pop() || '',
                prenom: authUser.displayName?.split(' ').slice(0, -1).join(' ') || '',
                photoURL: authUser.photoURL || undefined,
              };
              this.profileService.createUserProfile(newProfileData)
                .then(() => {
                  this.userProfileSubject.next(newProfileData);
                })
                .catch(err => console.error('Erreur création profil de base', err));
            }
          });
        }
      }),
      catchError((err: any) => {
        this.errorMessage = 'Erreur lors du chargement du profil.';
        this.userProfileSubject.next(null);
        console.error(err);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        this.loadProfileDataIntoEditableFromSubject();
      })
    ).subscribe();
  }

  loadProfileDataIntoEditableFromSubject() {
      const currentProfile = this.userProfileSubject.value;
      if (currentProfile) {
          this.editableProfileInModal = { ...currentProfile, userId: currentProfile.userId || currentProfile.id };
      } else {
           this.currentUserAuth$.pipe(first()).subscribe(authUser => {
                this.editableProfileInModal = {
                    userId: authUser?.uid || '',
                    email: authUser?.email || '',
                    nom: authUser?.displayName?.split(' ').pop() || '',
                    prenom: authUser?.displayName?.split(' ').slice(0, -1).join(' ') || '',
                    photoURL: authUser?.photoURL || undefined,
                };
           });
      }
  }

  async openEditProfileModal(profileData?: UserProfile | null) {
    this.selectedAvatarFile = null;
    if (profileData) {
      this.editableProfileInModal = { ...profileData, userId: profileData.userId || profileData.id };
    } else {
      const authUser = await this.currentUserAuth$.pipe(first()).toPromise();
      if (authUser && authUser.uid && authUser.email) {
        this.editableProfileInModal = {
          userId: authUser.uid,
          email: authUser.email,
          nom: authUser.displayName?.split(' ').pop() || '',
          prenom: authUser.displayName?.split(' ').slice(0, -1).join(' ') || '',
          photoURL: authUser.photoURL || undefined,
          telephone: '',
          titrePoste: '',
          adresse: '',
          resumePersonnel: ''
        };
      } else {
        this.presentToast("Impossible d'initialiser le profil, utilisateur non identifié.", 'danger');
        return; 
      }
    }
    this.isEditModalOpen = true;
  }

  dismissEditModal() {
    this.isEditModalOpen = false;
    this.selectedAvatarFile = null; 
    this.loadProfileDataIntoEditableFromSubject();
  }

  triggerAvatarUpload() {
    if (this.avatarFileInput && this.avatarFileInput.nativeElement) {
        this.avatarFileInput.nativeElement.click();
    }
  }

  handleAvatarSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedAvatarFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.editableProfileInModal) {
          this.editableProfileInModal.photoURL = e.target.result;
        }
      };
      reader.readAsDataURL(this.selectedAvatarFile);
    }
  }

  async handleSaveProfileFromModal() {
    console.log('Tentative de sauvegarde avec editableProfileInModal:', JSON.stringify(this.editableProfileInModal));

    if (!this.editableProfileInModal || !this.editableProfileInModal.userId || !this.editableProfileInModal.email) {
      this.presentToast('Données de profil invalides : ID utilisateur ou email manquant.', 'danger');
      return;
    }
    if (!this.editableProfileInModal.nom?.trim() || !this.editableProfileInModal.prenom?.trim()) {
      this.presentToast('Le nom et le prénom sont obligatoires.', 'warning');
      return;
    }
    
    const currentUserAuth = this.authService.getCurrentUser();
    if (currentUserAuth && this.editableProfileInModal.email && currentUserAuth.email !== this.editableProfileInModal.email) {
        this.editableProfileInModal.email = currentUserAuth.email || '';
    } else if (currentUserAuth && !this.editableProfileInModal.email) {
        this.editableProfileInModal.email = currentUserAuth.email || '';
    }

    this.isSaving = true;
    this.isUploadingAvatar = false;

    const profileToSave: Partial<UserProfile> = {
        userId: this.editableProfileInModal.userId,
        email: this.editableProfileInModal.email,
        nom: this.editableProfileInModal.nom,
        prenom: this.editableProfileInModal.prenom,
        telephone: this.editableProfileInModal.telephone || '',
        titrePoste: this.editableProfileInModal.titrePoste || '',
        adresse: this.editableProfileInModal.adresse || '',
        resumePersonnel: this.editableProfileInModal.resumePersonnel || '',
        photoURL: this.editableProfileInModal.photoURL || undefined
    };

    if (this.selectedAvatarFile && profileToSave.userId) {
      this.isUploadingAvatar = true;
      try {
        const newPhotoURL = await this.storageService.uploadFile(
          this.selectedAvatarFile,
          `profile_pictures/${profileToSave.userId}/${this.selectedAvatarFile.name}`
        );
        profileToSave.photoURL = newPhotoURL;
      } catch (error) {
        console.error('Erreur upload avatar:', error);
        this.presentToast('Erreur lors de l\'upload de la nouvelle photo.', 'danger');
        this.isSaving = false;
        this.isUploadingAvatar = false;
        return;
      }
      this.isUploadingAvatar = false;
    }

    try {
      await this.profileService.updateUserProfile(profileToSave);
      this.presentToast('Profil mis à jour avec succès !', 'success');
      this.isEditModalOpen = false;
      this.selectedAvatarFile = null;
      this.loadProfile(); 
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      this.presentToast('Erreur lors de la mise à jour du profil.', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' | 'light') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [{ text: 'OK', role: 'cancel'}]
    });
    toast.present();
  }
}