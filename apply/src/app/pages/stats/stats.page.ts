import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
IonHeader, IonToolbar, IonTitle, IonContent, IonButton
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service'; // Optionnel ici

@Component({
selector: 'app-stats',
templateUrl: './stats.page.html',
styleUrls: [], // Pas de styles spécifiques pour ce test
standalone: true,
imports: [
CommonModule,
IonHeader, IonToolbar, IonTitle, IonContent, IonButton
]
})
export class StatsPage {
constructor(private headerService: HeaderService) {}

ionViewWillEnter() {
this.headerService.updateTitle('Statistiques (Test)');
this.headerService.setShowBackButton(false);
}

testStatsClick() {
const message = 'Clic sur StatsPage fonctionne !';
console.log(message);
alert(message);
}
}