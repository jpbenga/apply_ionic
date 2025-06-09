import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { 
  IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonPopover, IonContent,
  IonItem, IonLabel, IonList, IonAvatar
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { Subscription } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { personCircle, logOutOutline, settingsOutline, arrowBack, documentTextOutline, createOutline, closeCircleOutline } from 'ionicons/icons'; // SUPPRIMÉ

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
  private routerEventsSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {
    // addIcons({  // SUPPRIMÉ
    //   personCircle, logOutOutline, settingsOutline, arrowBack, documentTextOutline,
    //   createOutline, closeCircleOutline
    // });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
        this.user = user;
        this.cdr.detectChanges();
      })
    );
    
    this.routerEventsSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary' || route.outlet === 'tabs'),
      switchMap(route => route.data),
      tap(() => {
        // Permet aux pages de détail de définir leur titre via HeaderService si besoin
        // Cette logique ici sera pour les titres par défaut des routes principales
      })
    ).subscribe(data => {
      const currentUrl = this.router.url;
      let newTitle = 'Apply'; // Titre par défaut
      let newShowBackButton = false;

      if (data && data['title']) {
        newTitle = data['title'];
        newShowBackButton = data['showBackButton'] === true;
      } else {
        // Fallback pour les titres si non définis dans route.data
        if (currentUrl.includes('/tabs/dashboard')) {
          newTitle = 'Tableau de Bord';
        } else if (currentUrl.includes('/tabs/postuler')) {
          newTitle = 'Postuler';
        } else if (currentUrl.includes('/tabs/stats')) {
          newTitle = 'Statistiques';
        } else if (currentUrl.includes('/profile')) {
          newTitle = 'Mon Profil';
          newShowBackButton = true;
        } else if (currentUrl.includes('/my-cv')) {
          newTitle = 'Mon CV Structuré';
          newShowBackButton = true;
        } else if (currentUrl.includes('/candidature/')) {
          // Pour les détails, le titre est souvent dynamique et mis par la page elle-même
          // Mais on peut s'assurer que le bouton retour est là
          newShowBackButton = true;
        }
      }
      
      // On utilise le HeaderService pour que les pages puissent aussi l'influencer
      // Si un titre a été poussé par une page via HeaderService, on ne l'écrase pas ici
      // sauf si on navigue vers une route qui a un titre défini dans ses data.
      // Cette logique est pour s'assurer qu'au retour, le titre est correct.
      // La page qui devient active (via ionViewWillEnter) devrait avoir la priorité pour son titre.
      // Donc, on s'abonne juste aux valeurs du service ici.
    });

    this.subscriptions.push(
      this.headerService.currentTitle.subscribe(titleValue => {
        if(this.title !== titleValue) {
          this.title = titleValue;
          this.cdr.detectChanges();
        }
      })
    );
    this.subscriptions.push(
      this.headerService.showBackButton.subscribe(show => {
        if(this.showBackButton !== show) {
          this.showBackButton = show;
          this.cdr.detectChanges();
        }
      })
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
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