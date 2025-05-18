// src/app/pages/home/home.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

// Importation correcte pour Ionic 8
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ],
})
export class HomePage {
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}