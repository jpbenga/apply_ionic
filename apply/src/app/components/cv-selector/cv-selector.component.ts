// src/app/components/cv-selector/cv-selector.component.ts
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel, IonRadio, IonRadioGroup, IonButton, IonIcon } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { GeneratedCv } from 'src/app/models/cv-template.model';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';
import { CvTemplateService } from 'src/app/services/cv-template/cv-template.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { documentTextOutline, trashOutline, createOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cv-selector',
  templateUrl: './cv-selector.component.html',
  styleUrls: ['./cv-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonItem, 
    IonLabel, 
    IonRadio, 
    IonRadioGroup, 
    IonButton, 
    IonIcon
  ]
})
export class CvSelectorComponent implements OnInit, OnDestroy {
  @Output() cvSelected = new EventEmitter<GeneratedCv>();
  @Output() createNewCv = new EventEmitter<void>();

  generatedCvs$: Observable<GeneratedCv[]>;
  selectedCvId: string | null = null;
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private cvGenerationService: CvGenerationService,
    private cvTemplateService: CvTemplateService
  ) {
    addIcons({ documentTextOutline, trashOutline, createOutline, eyeOutline });
    this.generatedCvs$ = this.cvGenerationService.getGeneratedCvs();
  }

  ngOnInit() {
    this.loadGeneratedCvs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Rendre la méthode publique
  loadGeneratedCvs() {
    this.isLoading = true;
    this.error = null;

    this.generatedCvs$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cvs) => {
        this.isLoading = false;
        // Sélectionne automatiquement le premier CV s'il y en a
        if (cvs.length > 0 && !this.selectedCvId) {
          this.selectCv(cvs[0]);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des CVs:', error);
        this.error = 'Impossible de charger les CVs sauvegardés';
        this.isLoading = false;
      }
    });
  }

  selectCv(cv: GeneratedCv) {
    this.selectedCvId = cv.id;
    this.cvSelected.emit(cv);
  }

  onCvSelectionChange(cvId: string, cvs: GeneratedCv[]) {
    const selectedCv = cvs.find(cv => cv.id === cvId);
    if (selectedCv) {
      this.selectCv(selectedCv);
    }
  }

  async deleteCv(cv: GeneratedCv, event: Event) {
    event.stopPropagation();
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce CV ?`)) {
      try {
        await this.cvGenerationService.deleteGeneratedCv(cv.id);
        // Si c'était le CV sélectionné, réinitialiser la sélection
        if (this.selectedCvId === cv.id) {
          this.selectedCvId = null;
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du CV');
      }
    }
  }

  getTemplateName(templateId: string): string {
    const template = this.cvTemplateService.getTemplateById(templateId);
    return template?.name || 'Template inconnu';
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  onCreateNewCv() {
    this.createNewCv.emit();
  }

  // Ajouter la méthode trackBy manquante
  trackByCvId(index: number, cv: GeneratedCv): string {
    return cv.id;
  }
}