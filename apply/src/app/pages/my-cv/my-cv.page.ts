import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonSpinner,
  IonListHeader // <<< AJOUTE CET IMPORT
} from '@ionic/angular/standalone';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { HeaderService } from 'src/app/services/header/header.service';
import { addIcons } from 'ionicons';
import { addOutline, listOutline, businessOutline } from 'ionicons/icons';

@Component({
  selector: 'app-my-cv',
  templateUrl: './my-cv.page.html',
  styleUrls: ['./my-cv.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonFab, 
    IonFabButton, 
    IonIcon, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonSpinner,
    IonListHeader, // <<< AJOUTE IonListHeader ICI AUSSI
    UserHeaderComponent
  ]
})
export class MyCvPage implements OnInit {
  isLoadingExperiences: boolean = false;

  constructor(private headerService: HeaderService) {
    addIcons({ addOutline, listOutline, businessOutline });
   }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon CV Structuré');
    this.headerService.setShowBackButton(true);
    this.loadExperiences();
  }

  loadExperiences() {
    console.log('Chargement des expériences...');
  }

  addExperience() {
    console.log('Ajouter une nouvelle expérience');
  }
}