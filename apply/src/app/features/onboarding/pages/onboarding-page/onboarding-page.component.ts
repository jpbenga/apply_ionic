import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OnboardingStepOneComponent } from '../../components/onboarding-step-one/onboarding-step-one.component';
import { OnboardingStepTwoComponent } from '../../components/onboarding-step-two/onboarding-step-two.component';
import { OnboardingStepThreeComponent } from '../../components/onboarding-step-three/onboarding-step-three.component';
// Assuming Router will be used later for actual navigation
// import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding-page',
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    OnboardingStepOneComponent,
    OnboardingStepTwoComponent,
    OnboardingStepThreeComponent
  ]
})
export class OnboardingPageComponent {
  currentStep: number = 1;

  // constructor(private router: Router) { } // Inject Router if navigation is implemented here

  constructor() { }

  goToNextStep(): void {
    this.currentStep++;
    if (this.currentStep > 3) {
      // This case should ideally be handled by step three's complete event
      // but as a fallback if next is called somehow from step 3.
      this.handleOnboardingComplete();
    }
    console.log('Current step:', this.currentStep);
  }

  skipOnboarding(): void {
    console.log('Onboarding skipped. Navigate to dashboard.');
    // this.router.navigate(['/tabs/dashboard']); // Example navigation
  }

  handleOnboardingComplete(formData?: any): void {
    console.log('Onboarding complete. Form data:', formData);
    console.log('Navigate to dashboard.');
    // this.router.navigate(['/tabs/dashboard']); // Example navigation
  }

  // Optional: for direct navigation to a step (e.g., if dots were clickable)
  goToStep(step: number): void {
    if (step >= 1 && step <= 3) {
      this.currentStep = step;
      console.log('Navigating to step:', this.currentStep);
    }
  }
}
