import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonSpinner, IonText, IonIcon, IonButton, IonButtons, IonRefresher, IonRefresherContent, IonBadge
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { CandidatureService } from 'src/app/services/candidature/candidature.service';
import { Candidature } from 'src/app/models/candidature.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonSpinner, IonText, IonIcon, IonButton, IonButtons, IonRefresher, IonRefresherContent,
    IonBadge
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
    if (!candidatureId) return;
    this.router.navigate(['/candidature', candidatureId]);
  }

  goToPostulerPage() {
    this.router.navigate(['/tabs/postuler']);
  }
}