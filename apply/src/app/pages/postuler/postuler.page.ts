import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon, IonLabel // IonLabel pour le bouton si besoin, IonIcon pour les icônes des boutons
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service'; // Tu peux garder HeaderService

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonIcon, IonLabel // Assure-toi que les imports correspondent à ton HTML minimal
  ]
})
export class PostulerPage {
  constructor(private headerService: HeaderService) { } // HeaderService peut être utilisé si UserHeaderComponent est ajouté ici plus tard

  ionViewWillEnter() {
    // Si tu utilises UserHeaderComponent DANS CETTE PAGE, tu mettrais à jour le titre ici
    // this.headerService.updateTitle('Postuler');
    // this.headerService.setShowBackButton(false); // Typique pour une page racine d'onglet
  }

  selectCv() {
    console.log('Clic sur Bouton Test "Choisir CV" dans PostulerPage');
    alert('Clic sur Bouton Test "Choisir CV" dans PostulerPage');
  }

  generateApplication() {
    console.log('Clic sur Bouton Test "Générer" dans PostulerPage');
    alert('Clic sur Bouton Test "Générer" dans PostulerPage');
  }
}