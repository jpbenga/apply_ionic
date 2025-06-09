import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  // Existing icons from app.component.ts
  home, add, statsChart, arrowBack, createOutline, closeCircleOutline, mailOutline,
  callOutline, chatbubbleEllipsesOutline, mailUnreadOutline, documentTextOutline,
  saveOutline, personCircle, logOut, settings, addCircleOutline, cloudOfflineOutline,
  fileTrayOutline, copyOutline, documentAttachOutline, sparklesOutline, checkmarkCircle,
  warning, close,
  // Icons from CandidatureCardComponent
  eyeOutline, trashOutline, checkboxOutline, // checkmarkCircle already listed
  // Icons from CompetenceModalComponent
  // closeCircleOutline, saveOutline already listed
  // Icons from CvDataValidationModalComponent
  checkmarkOutline, closeOutline, businessOutline, schoolOutline, starOutline, personOutline,
  // createOutline, trashOutline already listed
  chevronDownOutline, chevronUpOutline,
  // Icons from CvSelectorComponent
  // documentTextOutline, trashOutline, createOutline, eyeOutline already listed
  // Icons from CvUploadComponent
  cloudUploadOutline, alertCircleOutline, checkmarkCircleOutline,
  // documentTextOutline, closeCircleOutline already listed
  // Icons from ExperienceModalComponent
  // closeCircleOutline, saveOutline, trashOutline already listed
  // Icons from FormationModalComponent
  // closeCircleOutline, saveOutline already listed
  // Icons from GenerateCvModalComponent
  // closeOutline already listed
  // Icons from UserHeaderComponent
  // personCircle, logOutOutline, settingsOutline, arrowBack, documentTextOutline, createOutline, closeCircleOutline already listed
  logOutOutline, settingsOutline, // Explicitly adding if different from logOut, settings
  // Icons from LoginPage
  logoGoogle,
  // Icons from SignupPage (checkmarkCircleOutline already listed)
  // Icons from CandidatureDetailPage (most seem covered, trashOutline, mailOutline, etc.)
  // Icons from DashboardPage
  square, // addCircleOutline, cloudOfflineOutline, fileTrayOutline, add, checkboxOutline, trashOutline, checkmarkCircleOutline already listed
  // Icons from MyCvPage
  addOutline, listOutline, // warningOutline already listed
  // businessOutline, createOutline, trashOutline, schoolOutline, starOutline, cloudOfflineOutline, documentTextOutline, copyOutline already listed
  warningOutline,
  // Icons from ProfilePage
  personAddOutline // personCircleOutline, createOutline, saveOutline, close already listed
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
      // Existing icons from app.component.ts
      home, add, statsChart, arrowBack, createOutline, closeCircleOutline, mailOutline,
      callOutline, chatbubbleEllipsesOutline, mailUnreadOutline, documentTextOutline,
      saveOutline, personCircle, logOut, settings, addCircleOutline, cloudOfflineOutline,
      fileTrayOutline, copyOutline, documentAttachOutline, sparklesOutline, checkmarkCircle,
      warning, close,
      // Icons from CandidatureCardComponent
      eyeOutline, trashOutline, checkboxOutline,
      // Icons from CvDataValidationModalComponent
      checkmarkOutline, closeOutline, businessOutline, schoolOutline, starOutline, personOutline,
      chevronDownOutline, chevronUpOutline,
      // Icons from CvUploadComponent
      cloudUploadOutline, alertCircleOutline, checkmarkCircleOutline,
      // Icons from UserHeaderComponent
      logOutOutline, settingsOutline, // Assuming these are distinct or correctly named
      // Icons from LoginPage
      logoGoogle,
      // Icons from DashboardPage
      square,
      // Icons from MyCvPage
      addOutline, listOutline, warningOutline,
      // Icons from ProfilePage
      personAddOutline
      // All other icons were either duplicates or already present.
    });
  }
}