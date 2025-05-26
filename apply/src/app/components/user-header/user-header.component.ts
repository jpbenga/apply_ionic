import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { 
  IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonPopover, IonContent,
  IonItem, IonLabel, IonList, IonAvatar
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { personCircle, logOutOutline, settingsOutline, arrowBack, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonPopover, IonContent, IonItem, IonLabel, IonList, IonAvatar
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
    addIcons({ personCircle, logOutOutline, settingsOutline, arrowBack, documentTextOutline });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.user$.subscribe(user => this.user = user)
    );
    this.subscriptions.push(
      this.headerService.currentTitle.subscribe(title => this.title = title)
    );
    this.subscriptions.push(
      this.headerService.showBackButton.subscribe(show => this.showBackButton = show)
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  presentPopover(e: Event) {
    this.isOpen = true;
  }

  async logout() {
    this.isOpen = false;
    try {
      await this.authService.signOut();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }

  navigateToProfile() {
    this.isOpen = false;
    this.router.navigateByUrl('/profile');
  }

  navigateToMyCv() {
    this.isOpen = false;
    this.router.navigateByUrl('/my-cv');
  }

  goBack() {
    this.headerService.goBack();
  }
}