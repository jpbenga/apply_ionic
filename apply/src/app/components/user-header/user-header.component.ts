// src/app/components/user-header/user-header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonPopover, IonContent,
  IonItem, IonLabel, IonList, IonAvatar, IonBackButton
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { personCircle, logOut, settings, documentText, arrowBack } from 'ionicons/icons';
import { HeaderService } from 'src/app/services/header/header.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonPopover,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonAvatar,
    IonBackButton
  ]
})
export class UserHeaderComponent implements OnInit, OnDestroy {
  title: string = 'Apply';
  showBackButton: boolean = false;
  user: any = null;
  isOpen = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    public headerService: HeaderService
  ) {
    addIcons({ personCircle, logOut, settings, documentText, arrowBack });
  }

  ngOnInit() {
    // S'abonner aux changements de l'utilisateur
    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
        this.user = user;
      })
    );
    
    // S'abonner aux changements de titre avec console.log pour debug
    this.subscriptions.push(
      this.headerService.currentTitle.subscribe(title => {
        console.log('Header received new title:', title);
        this.title = title;
      })
    );
    
    // S'abonner à la visibilité du bouton retour
    this.subscriptions.push(
      this.headerService.showBackButton.subscribe(show => {
        this.showBackButton = show;
      })
    );
  }
  
  ngOnDestroy() {
    // Désabonnement pour éviter les fuites mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  presentPopover(e: Event) {
    this.isOpen = true;
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }

  navigateToProfile() {
    this.isOpen = false;
    this.router.navigateByUrl('/profile');
  }
  
  goBack() {
    this.headerService.goBack();
  }
}