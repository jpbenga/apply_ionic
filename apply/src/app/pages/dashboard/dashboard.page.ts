import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // DatePipe n'est plus importé ici car utilisé dans la carte
import { RouterModule, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSpinner, IonIcon, IonButton, IonButtons, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { CandidatureService } from 'src/app/services/candidature/candidature.service';
import { Candidature } from 'src/app/models/candidature.model';
import { CandidatureCardComponent } from '../../components/candidature-card/candidature-card.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSpinner, IonIcon, IonButton, IonButtons, IonRefresher, IonRefresherContent,
    CandidatureCardComponent
  ]
})
export class DashboardPage implements OnInit {
  public candidatures$: Observable<Candidature[]> = of([]);
  public isLoading: boolean = true;
  public errorLoading: string | null = null;

  constructor(
    private headerService: HeaderService,
    private candidatureService: CandidatureService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCandidatures();
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Tableau de Bord');
    this.headerService.setShowBackButton(false);
    this.loadCandidatures(); 
  }

  loadCandidatures(event?: any) {
    this.isLoading = true;
    this.errorLoading = null;
    this.candidatures$ = this.candidatureService.getCandidatures().pipe(
      finalize(() => {
        this.isLoading = false;
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
      }),
      catchError(error => {
        this.isLoading = false;
        this.errorLoading = 'Impossible de charger les candidatures.';
        console.error('Erreur chargement candidatures:', error);
        return of([]);
      })
    );
  }

  handleRefresh(event: any) {
    this.loadCandidatures(event);
  }

  viewCandidatureDetail(candidatureId: string | undefined) {
    if (!candidatureId) {
      console.error('ID de candidature non défini, navigation annulée.');
      return;
    }
    this.router.navigate(['/candidature', candidatureId]);
  }

  goToPostulerPage() {
    this.router.navigate(['/tabs/postuler']);
  }
}