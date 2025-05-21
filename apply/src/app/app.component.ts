import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'; // IonApp et IonRouterOutlet sont déjà standalone

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true, // <<< AJOUTE CECI
  imports: [
    IonApp,
    IonRouterOutlet
  ],
})
export class AppComponent {
  constructor() {}
}