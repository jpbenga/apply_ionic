import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service'; // Optionnel ici, mais gardons pour cohérence

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: [], // Pas de styles spécifiques pour ce test
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton
  ]
})
export class DashboardPage {
  constructor(private headerService: HeaderService) {}

  ionViewWillEnter() {
    this.headerService.updateTitle('Tableau de Bord (Test)');
    this.headerService.setShowBackButton(false);
  }

  testDashboardClick() {
    const message = 'Clic sur DashboardPage fonctionne !';
    console.log(message);
    alert(message);
  }
}