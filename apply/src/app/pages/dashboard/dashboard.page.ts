import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  IonHeader, IonContent, IonSpinner, IonIcon, IonButton,
  IonRefresher, IonRefresherContent, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { CandidatureService, GetCandidaturesOptions } from 'src/app/services/candidature/candidature.service';
import { Candidature } from 'src/app/models/candidature.model';
import { CandidatureCardComponent } from '../../components/candidature-card/candidature-card.component';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { addIcons } from 'ionicons';
import { addCircleOutline, cloudOfflineOutline, fileTrayOutline, add } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader, IonContent, IonSpinner, IonIcon, IonButton,
    IonRefresher, IonRefresherContent, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonFab, IonFabButton,
    UserHeaderComponent,
    CandidatureCardComponent
  ]
})
export class DashboardPage implements OnInit {
  public candidatures$: Observable<Candidature[]> = of([]);
  public isLoading: boolean = true;
  public errorLoading: string | null = null;

  public sortByDate: 'asc' | 'desc' = 'desc';

  public optionsDeTri: { value: 'asc' | 'desc', label: string }[] = [
    { value: 'desc', label: 'Plus récentes d\'abord' },
    { value: 'asc', label: 'Plus anciennes d\'abord' }
  ];

  constructor(
    public headerService: HeaderService,
    private candidatureService: CandidatureService,
    private router: Router
  ) {
    addIcons({ addCircleOutline, cloudOfflineOutline, fileTrayOutline, add });
  }

  ngOnInit() {
    // this.loadCandidatures();
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Tableau de Bord');
    this.headerService.setShowBackButton(false);
    this.loadCandidatures();
  }

  loadCandidatures(event?: any) {
    this.isLoading = true;
    this.errorLoading = null;

    const options: GetCandidaturesOptions = {
      sortByDate: this.sortByDate
    };

    this.candidatures$ = this.candidatureService.getCandidatures(options).pipe(
      finalize(() => {
        this.isLoading = false;
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
      }),
      catchError(error => {
        this.isLoading = false;
        this.errorLoading = 'Impossible de charger les candidatures.';
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
        console.error('Erreur chargement candidatures:', error);
        return of([]);
      })
    );
  }

  onSortChange() {
    this.loadCandidatures();
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