// src/app/pages/stats/stats.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonBadge,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { addIcons } from 'ionicons';
import { trophy, flame, trendingUp, calendar } from 'ionicons/icons';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent,
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonBadge,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonSegment,
    IonSegmentButton
  ]
})
export class StatsPage implements OnInit {
  selectedPeriod: string = 'month'; // 'week', 'month', 'year'

  constructor(private headerService: HeaderService) {
    // Ajouter les icônes utilisées dans cette page
    addIcons({ trophy, flame, trendingUp, calendar });
  }

  ngOnInit() {
    // Initialisation de base
  }

  // Cet événement est appelé CHAQUE FOIS que la page devient visible
  ionViewWillEnter() {
    console.log('Stats: ionViewWillEnter');
    this.headerService.updateTitle('Statistiques');
    this.headerService.setShowBackButton(false);
  }

  segmentChanged(event: any) {
    this.selectedPeriod = event.detail.value;
    console.log('Période sélectionnée:', this.selectedPeriod);
    // Ici, vous pourriez rafraîchir les données affichées
  }
}