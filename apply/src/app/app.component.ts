import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  home, add, statsChart,
  arrowBack, createOutline, closeCircleOutline, mailOutline, callOutline,
  chatbubbleEllipsesOutline, mailUnreadOutline, documentTextOutline, saveOutline,
  personCircle, logOut, settings,
  addCircleOutline, cloudOfflineOutline, fileTrayOutline,
  copyOutline, documentAttachOutline,
  sparklesOutline, checkmarkCircle, warning, close // 'close' est aussi utilisée
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet
  ],
})
export class AppComponent {
  constructor() {
    addIcons({
      home, add, statsChart,
      arrowBack, createOutline, closeCircleOutline, mailOutline, callOutline,
      chatbubbleEllipsesOutline, mailUnreadOutline, documentTextOutline, saveOutline,
      personCircle, logOut, settings,
      addCircleOutline, cloudOfflineOutline, fileTrayOutline,
      copyOutline, documentAttachOutline,
      sparklesOutline, checkmarkCircle, warning, close
    });
  }
}