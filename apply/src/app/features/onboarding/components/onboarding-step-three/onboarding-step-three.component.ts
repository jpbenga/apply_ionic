import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';
import { InputComponent } from '../../../../components/shared/input/input.component'; // Import app-input

@Component({
  selector: 'app-onboarding-step-three',
  templateUrl: './onboarding-step-three.component.html',
  styleUrls: ['./onboarding-step-three.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LogoComponent, ButtonComponent, InputComponent] // Add InputComponent
})
export class OnboardingStepThreeComponent {
  @Output() completeOnboardingClicked = new EventEmitter<any>();
  @Output() skipClicked = new EventEmitter<void>();

  formValues = {
    poste: '',
    secteur: '',
    localisation: ''
  };
  formIsValid: boolean = false;
  completeButtonText: string = "Terminer l'Onboarding";

  constructor() { }

  onInputValueChange(field: 'poste' | 'secteur' | 'localisation', value: string): void {
    if (field in this.formValues) {
      this.formValues[field] = value;
    }
    this.validateForm();
  }

  validateForm(): void {
    // Check if at least one field has a value (as per prototype's logic for enabling the button)
    if (this.formValues.poste.trim().length > 0 ||
        this.formValues.secteur.trim().length > 0 ||
        this.formValues.localisation.trim().length > 0) {
      this.formIsValid = true;
      this.completeButtonText = "Voir les offres"; // Change button text as in prototype
    } else {
      this.formIsValid = false;
      this.completeButtonText = "Terminer l'Onboarding";
    }
  }

  complete(): void {
    if (!this.formIsValid) return;
    console.log('Complete button clicked on Onboarding Step Three', this.formValues);
    this.completeOnboardingClicked.emit(this.formValues);
  }

  skip(): void {
    console.log('Skip button clicked on Onboarding Step Three');
    this.skipClicked.emit();
  }
}
