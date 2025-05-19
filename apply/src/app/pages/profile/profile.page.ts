// src/app/pages/profile/profile.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea, 
  IonButton, 
  IonIcon, 
  IonAvatar,
  IonToggle,
  IonHeader
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { addIcons } from 'ionicons';
import { documentText, cloudUpload, logOut } from 'ionicons/icons';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent,
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonTextarea, 
    IonButton, 
    IonIcon, 
    IonAvatar,
    IonToggle,
    IonHeader,
    UserHeaderComponent  
  ]
})
export class ProfilePage implements OnInit {

  constructor(private headerService: HeaderService) {
    // Ajouter les icônes utilisées dans cette page
    addIcons({ documentText, cloudUpload, logOut });
  }

  ngOnInit() {
    // Initialisation de base
  }

  // Cet événement est appelé CHAQUE FOIS que la page devient visible
  ionViewWillEnter() {
    console.log('Profile: ionViewWillEnter');
    this.headerService.updateTitle('Mon Profil');
    this.headerService.setShowBackButton(true);
  }

  // Appelé quand on quitte la page
  ionViewWillLeave() {
    console.log('Profile: ionViewWillLeave');
    this.headerService.setShowBackButton(false);
  }
  
  // Fonction pour la déconnexion
  logout() {
    // Implémenter la déconnexion ici
    console.log('Déconnexion');
  }
}