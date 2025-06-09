// src/app/components/cv-data-validation-modal/cv-data-validation-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
  IonIcon, IonList, IonItem, IonLabel, IonCheckbox, IonInput, IonTextarea,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItemGroup,
  IonGrid, IonRow, IonCol, IonChip, IonBadge,
  IonSelect, IonSelectOption, IonText,
  ModalController
} from '@ionic/angular/standalone';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import {
//   checkmarkOutline, closeOutline, businessOutline, schoolOutline,
//   starOutline, personOutline, createOutline, trashOutline,
//   chevronDownOutline, chevronUpOutline
// } from 'ionicons/icons'; // SUPPRIMÉ
import { ParsedCvData } from 'src/app/services/cv-parsing/cv-parsing.service';

interface ValidatedExperience {
  selected: boolean;
  data: any;
  isEditing: boolean;
}

interface ValidatedFormation {
  selected: boolean;
  data: any;
  isEditing: boolean;
}

interface ValidatedCompetence {
  selected: boolean;
  data: any;
  isEditing: boolean;
}

@Component({
  selector: 'app-cv-data-validation-modal',
  templateUrl: './cv-data-validation-modal.component.html',
  styleUrls: ['./cv-data-validation-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
    IonIcon, IonList, IonItem, IonLabel, IonCheckbox, IonInput, IonTextarea,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItemGroup,
    IonGrid, IonRow, IonCol, IonChip, IonBadge,
    IonSelect, IonSelectOption, IonText
  ],
})
export class CvDataValidationModalComponent implements OnInit {
  @Input() parsedData!: ParsedCvData;
  @Input() fileName: string = 'CV importé';

  public validatedExperiences: ValidatedExperience[] = [];
  public validatedFormations: ValidatedFormation[] = [];
  public validatedCompetences: ValidatedCompetence[] = [];
  public personalInfo: any = {};

  public selectedCount = 0;
  public expandedSections = {
    experiences: true,
    formations: true,
    competences: true,
    personalInfo: false
  };

  public competenceCategories = [
    'Techniques',
    'Langues',
    'Logiciels',
    'Certifications',
    'Soft Skills',
    'Autres'
  ];

  constructor(private modalCtrl: ModalController) {
    // addIcons({ // SUPPRIMÉ
    //   checkmarkOutline, closeOutline, businessOutline, schoolOutline,
    //   starOutline, personOutline, createOutline, trashOutline,
    //   chevronDownOutline, chevronUpOutline
    // });
  }

  ngOnInit() {
    this.initializeData();
    this.updateSelectedCount();
  }

  private initializeData() {
    // Initialiser les expériences
    this.validatedExperiences = (this.parsedData.experiences || []).map(exp => ({
      selected: true,
      data: { ...exp },
      isEditing: false
    }));

    // Initialiser les formations
    this.validatedFormations = (this.parsedData.formations || []).map(form => ({
      selected: true,
      data: { ...form },
      isEditing: false
    }));

    // Initialiser les compétences
    this.validatedCompetences = (this.parsedData.competences || []).map(comp => ({
      selected: true,
      data: { ...comp },
      isEditing: false
    }));

    // Initialiser les infos personnelles
    this.personalInfo = { ...(this.parsedData.personalInfo || {}) };
  }

  updateSelectedCount() {
    this.selectedCount = 
      this.validatedExperiences.filter(e => e.selected).length +
      this.validatedFormations.filter(f => f.selected).length +
      this.validatedCompetences.filter(c => c.selected).length;
  }

  toggleSection(section: keyof typeof this.expandedSections) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  selectAllExperiences(selectAll: boolean) {
    this.validatedExperiences.forEach(exp => exp.selected = selectAll);
    this.updateSelectedCount();
  }

  selectAllFormations(selectAll: boolean) {
    this.validatedFormations.forEach(form => form.selected = selectAll);
    this.updateSelectedCount();
  }

  selectAllCompetences(selectAll: boolean) {
    this.validatedCompetences.forEach(comp => comp.selected = selectAll);
    this.updateSelectedCount();
  }

  toggleExperienceEdit(index: number) {
    this.validatedExperiences[index].isEditing = !this.validatedExperiences[index].isEditing;
  }

  toggleFormationEdit(index: number) {
    this.validatedFormations[index].isEditing = !this.validatedFormations[index].isEditing;
  }

  toggleCompetenceEdit(index: number) {
    this.validatedCompetences[index].isEditing = !this.validatedCompetences[index].isEditing;
  }

  removeExperience(index: number) {
    this.validatedExperiences.splice(index, 1);
    this.updateSelectedCount();
  }

  removeFormation(index: number) {
    this.validatedFormations.splice(index, 1);
    this.updateSelectedCount();
  }

  removeCompetence(index: number) {
    this.validatedCompetences.splice(index, 1);
    this.updateSelectedCount();
  }

  formatDateForInput(dateStr: string | null): string {
    if (!dateStr) return '';
    
    // Si c'est au format YYYY-MM-DD, on le garde
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Si c'est au format YYYY-MM, on ajoute -01
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      return `${dateStr}-01`;
    }
    
    // Si c'est au format YYYY, on ajoute -01-01
    if (/^\d{4}$/.test(dateStr)) {
      return `${dateStr}-01-01`;
    }
    
    return dateStr;
  }

  formatDateForSave(dateStr: string): string {
    if (!dateStr) return '';
    
    // Retourner au format YYYY-MM-DD
    return dateStr;
  }

  getSelectedData(): ParsedCvData {
    return {
      experiences: this.validatedExperiences
        .filter(exp => exp.selected)
        .map(exp => ({
          ...exp.data,
          dateDebut: this.formatDateForSave(exp.data.dateDebut),
          dateFin: exp.data.enCours ? null : this.formatDateForSave(exp.data.dateFin)
        })),
      formations: this.validatedFormations
        .filter(form => form.selected)
        .map(form => ({
          ...form.data,
          dateDebut: this.formatDateForSave(form.data.dateDebut),
          dateFin: form.data.enCours ? null : this.formatDateForSave(form.data.dateFin)
        })),
      competences: this.validatedCompetences
        .filter(comp => comp.selected)
        .map(comp => comp.data),
      personalInfo: this.personalInfo
    };
  }

  async confirm() {
    const validatedData = this.getSelectedData();
    await this.modalCtrl.dismiss(validatedData, 'confirm');
  }

  async cancel() {
    await this.modalCtrl.dismiss(null, 'cancel');
  }

  get isAllExperiencesSelected(): boolean {
    return this.validatedExperiences.length > 0 && 
           this.validatedExperiences.every(exp => exp.selected);
  }

  get isAllFormationsSelected(): boolean {
    return this.validatedFormations.length > 0 && 
           this.validatedFormations.every(form => form.selected);
  }

  get isAllCompetencesSelected(): boolean {
    return this.validatedCompetences.length > 0 && 
           this.validatedCompetences.every(comp => comp.selected);
  }

  get hasPersonalInfo(): boolean {
    const info = this.personalInfo;
    return !!(info.nom || info.prenom || info.email || info.telephone || info.adresse);
  }
}