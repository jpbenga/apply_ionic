import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption
} from '@ionic/angular/standalone'; // IonTextarea et IonCheckbox non requis ici
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { Competence } from 'src/app/models/competence.model';
import { addIcons } from 'ionicons';
import { closeCircleOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-competence-modal',
  templateUrl: './competence-modal.component.html',
  styleUrls: ['./competence-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption
  ]
})
export class CompetenceModalComponent implements OnInit {
  @Input() competence: Partial<Competence> | null = null;
  @Input() isEditMode: boolean = false;

  competenceForm: FormGroup;
  // Si tu veux des catégories prédéfinies:
  categories: string[] = ['Langage de programmation', 'Framework/Librairie', 'Outil', 'Base de données', 'Langue', 'Soft skill', 'Autre'];


  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private fb: FormBuilder
  ) {
    addIcons({ closeCircleOutline, saveOutline });
    this.competenceForm = this.fb.group({
      nom: ['', Validators.required],
      categorie: [''] // Optionnel
    });
  }

  ngOnInit() {
    if (this.competence && this.isEditMode) {
      this.competenceForm.patchValue({
        nom: this.competence.nom,
        categorie: this.competence.categorie || ''
      });
    }
  }

  async save() {
    if (this.competenceForm.invalid) {
      this.presentToast('Le nom de la compétence est obligatoire.', 'warning');
      return;
    }

    const formData = this.competenceForm.getRawValue();
    const competenceData: Partial<Competence> = {
      ...this.competence,
      nom: formData.nom,
      categorie: formData.categorie || undefined // Assure undefined si vide pour Firestore
    };

    this.modalCtrl.dismiss(competenceData, 'save');
  }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color });
    toast.present();
  }
}