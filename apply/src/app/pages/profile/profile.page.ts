import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  IonHeader, IonContent, IonItem, IonLabel, IonInput,
  IonTextarea, IonButton, IonIcon, IonAvatar, IonSpinner, IonList
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from '@angular/fire/auth';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component'; // AJOUT
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonContent, IonItem, IonLabel, IonInput,
    IonTextarea, IonButton, IonIcon, IonAvatar, IonSpinner, IonList,
    UserHeaderComponent // AJOUT
    // IonToolbar, IonTitle, IonButtons, IonBackButton retirés
  ]
})
export class ProfilePage implements OnInit {
  userProfile$: Observable<UserProfile | undefined> = of(undefined);
  currentUserAuth$: Observable<User | null>;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    public headerService: HeaderService, // Rendu public
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.currentUserAuth$ = this.authService.user$;
    addIcons({ personCircleOutline });
  }

  ngOnInit() {
    this.loadProfile();
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon Profil');
    this.headerService.setShowBackButton(true); 
  }

  ionViewWillLeave() {
    this.headerService.setShowBackButton(false);
  }
  
  loadProfile() {
    this.isLoading = true;
    this.errorMessage = null;
    this.userProfile$ = this.profileService.getUserProfile();
    this.userProfile$.subscribe({
      next: (profile) => {
        this.isLoading = false;
        if (!profile) {
          console.log('Aucun profil Firestore trouvé pour cet utilisateur.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement du profil.';
        console.error(err);
      }
    });
  }
}