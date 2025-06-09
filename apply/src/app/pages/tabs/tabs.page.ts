import { Component } from '@angular/core'; // OnInit n'est plus forcément utile ici
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon,
  IonLabel, IonRouterOutlet
} from '@ionic/angular/standalone';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { statsChart, add, home } from 'ionicons/icons'; // SUPPRIMÉ
// HeaderService n'est plus directement utilisé par le template de TabsPage
// UserHeaderComponent n'est plus dans le template de TabsPage

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'], // Assure-toi que ce fichier est vide ou ne contient que les styles pour ion-tab-bar que tu avais avant (sans position:fixed)
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
  ]
})
export class TabsPage {
  constructor() { // Plus besoin de HeaderService ici si le header est géré par les pages enfants
    // addIcons({ statsChart, add, home }); // SUPPRIMÉ
  }

  // ngOnInit() {
  //   // Cette logique pourrait être déplacée ou gérée différemment
  // }
}