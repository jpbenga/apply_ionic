// src/app/pages/postuler/postuler.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea, 
  IonButton, 
  IonSegment, 
  IonSegmentButton 
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  styleUrls: ['./postuler.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonTextarea, 
    IonButton, 
    IonSegment, 
    IonSegmentButton
  ]
})
export class PostulerPage implements OnInit {

  constructor(private headerService: HeaderService) { }

  ngOnInit() {
    // Initialisation de base
  }

  // Cet événement est appelé CHAQUE FOIS que la page devient visible
  ionViewWillEnter() {
    console.log('Postuler: ionViewWillEnter');
    this.headerService.updateTitle('Postuler');
    this.headerService.setShowBackButton(false);
  }
}