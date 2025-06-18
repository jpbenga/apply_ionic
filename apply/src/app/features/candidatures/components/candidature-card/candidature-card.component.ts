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
    if (this.candidature && !this.candidature.keywordsArray) {
      this.candidature.keywordsArray = [];
    }
    if (this.candidature && typeof this.candidature.aiScore === 'string') {
        this.candidature.aiScore = parseFloat(this.candidature.aiScore);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidature']) {
      this.updateStatusColor();
      if (this.candidature && !this.candidature.keywordsArray) {
        this.candidature.keywordsArray = [];
      }
      if (this.candidature && typeof this.candidature.aiScore === 'string') {
        this.candidature.aiScore = parseFloat(this.candidature.aiScore);
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
      case StatutCandidature.ACCEPTEE: return 'accepted';
      case StatutCandidature.ENTRETIEN_PLANIFIE:
      case StatutCandidature.ENTRETIEN_FINAL:
        return 'interview';
      case StatutCandidature.OFFRE_RECUE: return 'offer';
      case StatutCandidature.REFUSEE_ENTREPRISE:
      case StatutCandidature.REFUSEE_CANDIDAT:
        return 'rejected';
      case StatutCandidature.EN_ATTENTE_REPONSE:
      case StatutCandidature.SOUMISE:
         return 'applied'; // Using 'applied' for these as per prototype example
      case StatutCandidature.ARCHIVEE: return 'archived'; // Needs style in SCSS
      case StatutCandidature.STANDBY: return 'standby'; // Needs style in SCSS
      default: return 'default';
    }
  }

  // Helper to get actual CSS variable string for statusColor property
  private getCSSColorVariable(statut?: StatutCandidature): string {
    switch (statut) {
      case StatutCandidature.ACCEPTEE: return 'var(--ion-color-success)'; // Green in prototype was #16A34A
      case StatutCandidature.ENTRETIEN_PLANIFIE:
      case StatutCandidature.ENTRETIEN_FINAL:
        return 'var(--ion-color-success)'; // Green in prototype was #10B981
      case StatutCandidature.OFFRE_RECUE: return 'var(--ion-color-warning)'; // Yellow in prototype was #F59E0B
      case StatutCandidature.REFUSEE_ENTREPRISE:
      case StatutCandidature.REFUSEE_CANDIDAT:
        return 'var(--ion-color-danger)'; // Red
      case StatutCandidature.SOUMISE:
      case StatutCandidature.EN_ATTENTE_REPONSE:
        return 'var(--ion-color-primary)'; // Blue in prototype was #3B82F6
      default: return 'var(--ion-color-medium)'; // Default grey
    }
  }
}