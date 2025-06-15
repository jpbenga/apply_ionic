import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Candidature, StatutCandidature } from '../../models/candidature.model';

@Component({
  selector: 'app-candidature-card',
  templateUrl: './candidature-card.component.html',
  styleUrls: ['./candidature-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TitleCasePipe
  ]
})
export class CandidatureCardComponent {
  @Input() candidature!: Candidature;
  @Input() isSelectionMode: boolean = false;
  @Input() isSelected: boolean = false;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() deleteCandidature = new EventEmitter<string>();
  @Output() selectionChanged = new EventEmitter<string>();

  onViewDetails(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
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
      case 'en_cours_rh':
        return 'primary';
      case 'offre_recue':
        return 'success';
      case 'test_technique':
        return 'warning';
      case 'refusee_entreprise':
      case 'refusee_candidat':
        return 'danger';
      case 'archivee':
        return 'dark';
      case 'standby':
        return 'warning';
      case 'envoyee':
        return 'secondary';
      case 'brouillon':
        return 'medium';
      default:
        return 'medium';
    }
  }

  getStatusLabel(statut: StatutCandidature): string {
    const statusLabels: { [key in StatutCandidature]: string } = {
      'brouillon': 'Brouillon',
      'envoyee': 'Envoyée',
      'en_cours_rh': 'En cours RH',
      'entretien_planifie': 'Entretien planifié',
      'test_technique': 'Test technique',
      'entretien_final': 'Entretien final',
      'offre_recue': 'Offre reçue',
      'acceptee': 'Acceptée',
      'refusee_candidat': 'Refusée par moi',
      'refusee_entreprise': 'Refusée',
      'archivee': 'Archivée',
      'standby': 'En attente'
    };
    return statusLabels[statut] || statut;
  }
}