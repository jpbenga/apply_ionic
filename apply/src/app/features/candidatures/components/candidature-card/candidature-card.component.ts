import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Candidature, StatutCandidature } from '../../models/candidature.model';

@Component({
  selector: 'app-candidature-card',
  templateUrl: './candidature-card.component.html',
  styleUrls: ['./candidature-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // For *ngIf, *ngFor, ngClass
    DatePipe,    // For formatting dates
    TitleCasePipe, // For formatting status text
    IonIcon      // For icons
  ]
})
export class CandidatureCardComponent implements OnInit, OnChanges {
  @Input() candidature!: Candidature;
  @Input() isSelectionMode: boolean = false; // Re-introduced
  @Input() isSelected: boolean = false;    // Re-introduced

  @Output() viewDetails = new EventEmitter<string>();
  @Output() deleteCandidature = new EventEmitter<string>();
  @Output() editCandidature = new EventEmitter<string>();
  @Output() selectionChanged = new EventEmitter<string>(); // Re-introduced

  statusColor: string = 'var(--ion-color-medium)';
  defaultCompanyColor: string = 'var(--ion-color-light-shade)'; // Fallback for logo background

  constructor() {}

  ngOnInit(): void {
    this.updateStatusColor();
    // Ensure keywordsArray is initialized if not present, for template safety
    if (this.candidature) { // Check if candidature is defined
      if (!this.candidature.keywordsArray) {
        this.candidature.keywordsArray = [];
      }
      if (typeof this.candidature.aiScore === 'string') {
        const parsedScore = parseFloat(this.candidature.aiScore);
        this.candidature.aiScore = isNaN(parsedScore) ? undefined : parsedScore; // Assign undefined if NaN
      } else if (typeof this.candidature.aiScore === 'undefined') {
        // aiScore is already undefined, nothing to do, or set a default visual if needed
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidature'] && this.candidature) { // Check if candidature is defined
      this.updateStatusColor();
      if (!this.candidature.keywordsArray) {
        this.candidature.keywordsArray = [];
      }
      if (typeof this.candidature.aiScore === 'string') {
        const parsedScore = parseFloat(this.candidature.aiScore);
        this.candidature.aiScore = isNaN(parsedScore) ? undefined : parsedScore; // Assign undefined if NaN
      } else if (typeof this.candidature.aiScore === 'undefined') {
        // aiScore is already undefined, or set a default visual
      }
    }
  }

  private updateStatusColor(): void {
    if (this.candidature?.statut) {
      this.statusColor = this.getCSSColorVariable(this.candidature.statut);
    }
  }

  onCardClick() {
    if (this.candidature?.id) {
      if (this.isSelectionMode) {
        this.selectionChanged.emit(this.candidature.id);
      } else {
        this.viewDetails.emit(this.candidature.id);
      }
    }
  }

  // onClick handlers for buttons should stop propagation to prevent onCardClick()
  onViewDetails(event: Event) {
    event.stopPropagation(); // Prevent card click if button is clicked
     if (this.candidature?.id) {
      this.viewDetails.emit(this.candidature.id);
    }
  }

  onEditCandidature(event: Event) {
    event.stopPropagation();
    if (this.candidature?.id) {
      this.editCandidature.emit(this.candidature.id);
    }
  }

  onDeleteCandidature(event: Event) {
    event.stopPropagation();
    if (this.candidature?.id) {
      this.deleteCandidature.emit(this.candidature.id);
    }
  }

  getCompanyInitials(entreprise?: string): string {
    if (!entreprise) return 'N/A';
    return entreprise.substring(0, 2).toUpperCase();
  }

  // For the status badge text - can be simple title case or more descriptive
  getDisplayStatus(statut?: StatutCandidature): string {
    if (!statut) return 'Inconnu';
    // Example: could map to more friendly names if needed
    // switch (statut) {
    //   case StatutCandidature.ENTRETIEN_PLANIFIE: return 'Entretien';
    //   default: return new TitleCasePipe().transform(statut.replace(/_/g, ' '));
    // }
    return new TitleCasePipe().transform(statut.replace(/_/g, ' '));
  }

  // For ngClass on status-badge and potentially for statusColor property
  getStatusClass(statut?: StatutCandidature): string {
    if (!statut) return 'default';
    switch (statut) {
      case 'acceptee': return 'accepted';
      case 'entretien_planifie':
      case 'entretien_final':
        return 'interview';
      case 'offre_recue': return 'offer';
      case 'refusee_entreprise':
      case 'refusee_candidat':
        return 'rejected';
      case 'en_attente_reponse':
      case 'envoyee': // 'envoyee' is from the model, maps to 'applied' style
         return 'applied';
      case 'archivee': return 'archived';
      case 'standby': return 'standby';
      // Adding other statuses from the model for completeness, though they might use 'default' style
      case 'brouillon': return 'default'; // Or a specific 'draft' style
      case 'en_cours_rh': return 'applied'; // Or a specific 'in-progress' style
      case 'test_technique': return 'interview'; // Or a specific 'test' style
      default: return 'default';
    }
  }

  // Helper to get actual CSS variable string for statusColor property
  private getCSSColorVariable(statut?: StatutCandidature): string {
    switch (statut) {
      case 'acceptee': return 'var(--ion-color-success)';
      case 'entretien_planifie':
      case 'entretien_final':
      case 'test_technique': // Grouping test_technique with interview for color
        return 'var(--ion-color-success)';
      case 'offre_recue': return 'var(--ion-color-warning)';
      case 'refusee_entreprise':
      case 'refusee_candidat':
        return 'var(--ion-color-danger)';
      case 'envoyee': // 'envoyee' is from the model
      case 'en_attente_reponse':
      case 'en_cours_rh': // Grouping en_cours_rh with applied/primary color
        return 'var(--ion-color-primary)';
      case 'standby': return 'var(--ion-color-warning)'; // Standby could also be warning or medium
      case 'brouillon': return 'var(--ion-color-medium)'; // Brouillon is likely medium
      case 'archivee': return 'var(--ion-color-dark)'; // Archivee could be dark or medium
      default: return 'var(--ion-color-medium)';
    }
  }
}