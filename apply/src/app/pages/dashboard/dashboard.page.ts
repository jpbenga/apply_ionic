import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, finalize, first } from 'rxjs/operators';
import {
  IonHeader, IonContent, IonSpinner, IonIcon,
  IonButton, IonRefresher, IonRefresherContent,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonFab, IonFabButton
  // IonToolbar, IonTitle, IonButtons ont été retirés car UserHeaderComponent les gère
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { CandidatureService, GetCandidaturesOptions } from 'src/app/services/candidature/candidature.service';
import { Candidature } from 'src/app/models/candidature.model'; // StatutCandidature n'est plus utilisé ici
import { CandidatureCardComponent } from '../../components/candidature-card/candidature-card.component';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component'; // Importe UserHeaderComponent
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
    UserHeaderComponent, // Assure-toi qu'il est ici
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
    private headerService: HeaderService, // Changé en private si non utilisé dans le template
    private candidatureService: CandidatureService,
    private router: Router
  ) {
    addIcons({ addCircleOutline, cloudOfflineOutline, fileTrayOutline, add });
  }

  ngOnInit() {
  }

ionViewWillEnter() {
  this.headerService.updateTitle('Tableau de Bord');
  this.headerService.setShowBackButton(false);
  this.loadCandidatures(); 
}

  loadCandidatures(event?: any) {
    this.isLoading = true;
    this.errorLoading = null;
    this.candidatures$ = of([]); 

    const options: GetCandidaturesOptions = {
      sortByDate: this.sortByDate
    };

    this.candidatures$ = this.candidatureService.getCandidatures(options).pipe(
      catchError(error => {
        this.errorLoading = 'Impossible de charger les candidatures.';
        console.error('Erreur chargement candidatures:', error);
        return of([]);
      }),
      finalize(() => {
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
      })
    );

    this.candidatures$.pipe(first()).subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false,
      complete: () => {
        if (this.isLoading){ 
          this.isLoading = false;
        }
      }
    });
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