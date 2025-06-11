import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import {
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonBadge, IonButton, IonIcon, IonText
} from '@ionic/angular/standalone';
import { Candidature } from '../../models/candidature.model'; // MODIFIED
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { eyeOutline, trashOutline, checkboxOutline, checkmarkCircle } from 'ionicons/icons'; // SUPPRIMÉ

@Component({
  selector: 'app-candidature-card',
  templateUrl: './candidature-card.component.html',
  styleUrls: ['./candidature-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TitleCasePipe,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonBadge, IonButton, IonIcon, IonText
  ]
})
export class CandidatureCardComponent {
  @Input() candidature!: Candidature;
  @Input() isSelectionMode: boolean = false;
  @Input() isSelected: boolean = false;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() deleteCandidature = new EventEmitter<string>();
  @Output() selectionChanged = new EventEmitter<string>();

  constructor() {
    // addIcons({ eyeOutline, trashOutline, checkboxOutline, checkmarkCircle }); // SUPPRIMÉ
  }

  onViewDetails() {
    if (this.isSelectionMode) {
      this.onToggleSelection();
    } else if (this.candidature?.id) {
      this.viewDetails.emit(this.candidature.id);
    }
  }

  onDeleteCandidature(event: Event) {
    event.stopPropagation();
    if (this.candidature?.id) {
      this.deleteCandidature.emit(this.candidature.id);
    }
  }

  onToggleSelection() {
    if (this.candidature?.id) {
      this.selectionChanged.emit(this.candidature.id);
    }
  }

  onCardClick() {
    if (this.isSelectionMode) {
      this.onToggleSelection();
    } else {
      this.onViewDetails();
    }
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'acceptee':
        return 'success';
      case 'entretien_planifie':
      case 'entretien_final':
        return 'primary';
      case 'refusee_entreprise':
      case 'refusee_candidat':
        return 'danger';
      case 'archivee':
        return 'dark';
      case 'standby':
        return 'warning';
      default:
        return 'medium';
    }
  }
}