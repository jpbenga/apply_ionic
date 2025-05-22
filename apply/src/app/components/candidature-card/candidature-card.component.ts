import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonLabel, IonBadge, IonItem, IonIcon 
} from '@ionic/angular/standalone';
import { Candidature } from 'src/app/models/candidature.model';

@Component({
  selector: 'app-candidature-card',
  templateUrl: './candidature-card.component.html',
  styleUrls: ['./candidature-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonLabel, IonBadge, IonItem, IonIcon
  ]
})
export class CandidatureCardComponent {
  @Input() candidature: Candidature | null = null;
  @Output() viewDetails = new EventEmitter<string>();

  constructor() { }

  onViewDetails() {
    if (this.candidature && this.candidature.id) {
      this.viewDetails.emit(this.candidature.id);
    }
  }

  getBadgeColor(statut: string | undefined): string {
    switch (statut) {
      case 'envoyee':
      case 'en_cours_rh':
        return 'medium';
      case 'entretien_planifie':
      case 'test_technique':
        return 'primary';
      case 'offre_recue':
      case 'acceptee':
        return 'success';
      case 'refusee_candidat':
      case 'refusee_entreprise':
        return 'danger';
      case 'archivee':
      case 'standby':
        return 'light';
      default:
        return 'medium';
    }
  }
}