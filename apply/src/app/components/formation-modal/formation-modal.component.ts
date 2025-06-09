import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon,
  IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox, IonDatetime, IonDatetimeButton,
  IonModal as IonModalController // Alias pour éviter conflit de nom avec le composant Modal de Angular
} from '@ionic/angular/standalone';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { Formation } from 'src/app/models/formation.model';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { closeCircleOutline, saveOutline } from 'ionicons/icons'; // SUPPRIMÉ

@Component({
  selector: 'app-formation-modal',
  templateUrl: './formation-modal.component.html',
  styleUrls: ['./formation-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon,
    IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox, IonDatetime, IonDatetimeButton,
    IonModalController
  ]
})
export class FormationModalComponent implements OnInit {
  @Input() formation: Partial<Formation> | null = null;
  @Input() isEditMode: boolean = false;

  formationForm: FormGroup;
  isCurrentFormation: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private fb: FormBuilder
  ) {
    // addIcons({ closeCircleOutline, saveOutline }); // SUPPRIMÉ
    this.formationForm = this.fb.group({
      diplome: ['', Validators.required],
      etablissement: ['', Validators.required],
      ville: [''],
      dateDebut: [null, Validators.required],
      dateFin: [null],
      enCours: [false],
      description: ['']
    });
  }

  ngOnInit() {
    if (this.formation && this.isEditMode) {
      this.isCurrentFormation = !!this.formation.enCours;
      this.formationForm.patchValue({
        ...this.formation,
        dateDebut: this.formation.dateDebut ? new Date(this.formation.dateDebut as string | Date).toISOString() : null,
        dateFin: this.formation.dateFin ? new Date(this.formation.dateFin as string | Date).toISOString() : null,
        enCours: this.isCurrentFormation
      });
      if (this.isCurrentFormation) {
        this.formationForm.get('dateFin')?.disable();
      }
    } else {
      this.formationForm.patchValue({
        dateDebut: new Date().toISOString(),
        enCours: false
      });
    }
  }

  onCurrentFormationToggle(event: any) {
    this.isCurrentFormation = event.detail.checked;
    if (this.isCurrentFormation) {
      this.formationForm.get('dateFin')?.setValue(null);
      this.formationForm.get('dateFin')?.disable();
    } else {
      this.formationForm.get('dateFin')?.enable();
    }
  }

  async save() {
    if (this.formationForm.invalid) {
      this.presentToast('Veuillez remplir tous les champs obligatoires.', 'warning');
      return;
    }

    const formData = this.formationForm.getRawValue();
    const formationData: Partial<Formation> = {
      ...this.formation,
      diplome: formData.diplome,
      etablissement: formData.etablissement,
      ville: formData.ville,
      dateDebut: formData.dateDebut ? new Date(formData.dateDebut).toISOString() : new Date().toISOString(),
      dateFin: this.isCurrentFormation || !formData.dateFin ? null : new Date(formData.dateFin).toISOString(),
      enCours: this.isCurrentFormation,
      description: formData.description
    };

    this.modalCtrl.dismiss(formationData, 'save');
  }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color });
    toast.present();
  }
}