import { Routes } from '@angular/router';
import { OnboardingPageComponent } from './pages/onboarding-page/onboarding-page.component';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: '', // Default route for the onboarding feature
    component: OnboardingPageComponent,
    // children: [
    //   // Example if steps were child routes:
    //   // { path: '', redirectTo: 'step-1', pathMatch: 'full' },
    //   // { path: 'step-1', component: OnboardingStepOneComponent }, // Would need to import StepOne etc.
    //   // { path: 'step-2', component: OnboardingStepTwoComponent },
    //   // { path: 'step-3', component: OnboardingStepThreeComponent },
    // ]
  }
  // Add other routes specific to the onboarding feature here if needed in the future
  // For example, a '/onboarding/completed' summary page.
];
