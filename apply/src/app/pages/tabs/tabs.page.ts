// src/app/pages/tabs/tabs.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, 
  IonLabel, IonRouterOutlet, IonHeader, IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { statsChart, add, home } from 'ionicons/icons';
import { UserHeaderComponent } from '../../components/user-header/user-header.component';
import { HeaderService } from 'src/app/services/header/header.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonHeader,  // Assurez-vous d'importer IonHeader
    IonContent,  // Assurez-vous d'importer IonContent
    UserHeaderComponent
  ]
})
export class TabsPage implements OnInit {
  constructor(private headerService: HeaderService) {
    addIcons({ statsChart, add, home });
  }

  ngOnInit() {
    // Le titre sera défini par les pages individuelles
    this.headerService.setShowBackButton(false); // Pas de bouton retour dans les tabs principales
  }
}