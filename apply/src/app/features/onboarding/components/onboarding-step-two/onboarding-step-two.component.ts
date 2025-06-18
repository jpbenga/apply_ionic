import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';

@Component({
  selector: 'app-onboarding-step-two',
  templateUrl: './onboarding-step-two.component.html',
  styleUrls: ['./onboarding-step-two.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LogoComponent, ButtonComponent]
})
export class OnboardingStepTwoComponent {
  @Output() nextClicked = new EventEmitter<void>();
  @Output() skipClicked = new EventEmitter<void>();

  cvUploaded: boolean = false;
  continueButtonText: string = 'Continuer';

  constructor() { }

  next(): void {
    if (!this.cvUploaded) return; // Should not be callable if button is disabled, but as a safeguard
    console.log('Next button clicked on Onboarding Step Two');
    this.nextClicked.emit();
  }

  skip(): void {
    console.log('Skip button clicked on Onboarding Step Two');
    this.skipClicked.emit();
  }

  uploadPDF(): void {
    console.log('Upload PDF clicked');
    // Simulate PDF upload
    setTimeout(() => {
      this.cvUploaded = true;
      this.continueButtonText = '✓ Continuer'; // Match prototype's success indication
      // In a real app, show a toast or success message
      console.log('CV PDF processed (simulated)');
    }, 1000);
  }

  importLinkedIn(): void {
    console.log('Import LinkedIn clicked');
    // Simulate LinkedIn import
    setTimeout(() => {
      this.cvUploaded = true;
      this.continueButtonText = '✓ Continuer'; // Match prototype's success indication
      // In a real app, handle OAuth flow
      console.log('LinkedIn profile imported (simulated)');
    }, 1000);
  }
}
