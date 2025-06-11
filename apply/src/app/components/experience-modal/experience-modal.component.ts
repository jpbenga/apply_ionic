import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox, IonDatetime, IonDatetimeButton, IonModal as IonModalController } from '@ionic/angular/standalone'; // Renommé IonModal en IonModalController pour éviter conflit
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { Experience } from 'src/app/models/experience.model'; 
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { closeCircleOutline, saveOutline, trashOutline } from 'ionicons/icons'; // SUPPRIMÉ

@Component({
  selector: 'app-experience-modal',
  templateUrl: './experience-modal.component.html',
  styleUrls: ['./experience-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon,
    IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox, IonDatetime, IonDatetimeButton, 
    IonModalController // Utilise l'alias ici
  ]
})
export class ExperienceModalComponent implements OnInit {
  @Input() experience: Partial<Experience> | null = null;
  @Input() isEditMode: boolean = false;

  experienceForm: FormGroup;
  isCurrentJob: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private fb: FormBuilder
  ) {
    // addIcons({ closeCircleOutline, saveOutline, trashOutline }); // SUPPRIMÉ
    this.experienceForm = this.fb.group({
      poste: ['', Validators.required],
      entreprise: ['', Validators.required],
      lieu: [''],
      dateDebut: [null, Validators.required],
      dateFin: [null],
      enCours: [false],
      description: ['']
    });
  }

  ngOnInit() {
    if (this.experience && this.isEditMode) {
      this.isCurrentJob = !!this.experience.enCours;
      this.experienceForm.patchValue({
        ...this.experience,
        dateDebut: this.experience.dateDebut ? new Date(this.experience.dateDebut as string | Date).toISOString() : null,
        dateFin: this.experience.dateFin ? new Date(this.experience.dateFin as string | Date).toISOString() : null,
        enCours: this.isCurrentJob
      });
      if (this.isCurrentJob) {
        this.experienceForm.get('dateFin')?.disable();
      }
    } else {
       this.experienceForm.patchValue({
        dateDebut: new Date().toISOString(), // Date du jour par défaut
        enCours: false
      });
    }
  }

  onCurrentJobToggle(event: any) { // Utilise CustomEvent ou any si le type exact n'est pas connu
    this.isCurrentJob = event.detail.checked;
    if (this.isCurrentJob) {
      this.experienceForm.get('dateFin')?.setValue(null);
      this.experienceForm.get('dateFin')?.disable();
    } else {
      this.experienceForm.get('dateFin')?.enable();
    }
  }

  async save() {
    if (this.experienceForm.invalid) {
      this.presentToast('Veuillez remplir tous les champs obligatoires.', 'warning');
      return;
    }

    const formData = this.experienceForm.getRawValue();
    const experienceData: Partial<Experience> = {
      ...this.experience, 
      poste: formData.poste,
      entreprise: formData.entreprise,
      lieu: formData.lieu,
      dateDebut: formData.dateDebut ? new Date(formData.dateDebut).toISOString() : new Date().toISOString(),
      dateFin: this.isCurrentJob || !formData.dateFin ? null : new Date(formData.dateFin).toISOString(),
      enCours: this.isCurrentJob,
      description: formData.description
    };

    this.modalCtrl.dismiss(experienceData, 'save');
  }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color });
    toast.present();
  }
}