// src/app/pages/dashboard/dashboard.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonBadge 
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonBadge
  ]
})
export class DashboardPage implements OnInit {

  constructor(private headerService: HeaderService) { }

  ngOnInit() {
    // Initialisation de base
  }

  // Cet événement est appelé CHAQUE FOIS que la page devient visible
  ionViewWillEnter() {
    console.log('Dashboard: ionViewWillEnter');
    this.headerService.updateTitle('Candidatures');
    this.headerService.setShowBackButton(false);
  }
}