import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';
import { InputComponent } from '../../../../components/shared/input/input.component';
// Router for actual navigation later
// import { Router } from '@angular/router';

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong' | '';
  text: string;
  color: string; // For text color of strength indicator
  progress: number; // Percentage for progress bar
}

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogoComponent,
    ButtonComponent,
    InputComponent
  ]
})
export class SignupPageComponent {
  currentStep: number = 1; // 1: Personal, 2: Security, 3: Final, 4: Success

  formData = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '' // Only for validation, not typically stored/sent
  };

  // Validation state for inputs, to provide feedback
  fieldErrors = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  formStepValidity = {
    step1: false,
    step2: false
  };

  passwordStrength: PasswordStrength = { level: '', text: '', color: '', progress: 0 };
  isLoading: boolean = false;

  // constructor(private router: Router) { }
  constructor() { }

  // --- Step Navigation ---
  nextStep(): void {
    if (this.currentStep === 1 && this.validateStep1()) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.validateStep2()) {
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      this.createAccount();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1 && this.currentStep <= 3) { // Can't go back from success
      this.currentStep--;
    }
  }

  // --- Input Handling & Validation ---
  onDisplayNameChange(value: string): void {
    this.formData.displayName = value;
    this.validateStep1();
  }
  onEmailChange(value: string): void {
    this.formData.email = value;
    this.validateStep1();
  }
  onPasswordChange(value: string): void {
    this.formData.password = value;
    this.updatePasswordStrength(value);
    this.validateStep2(); // Validate step2 whenever password changes
  }
  onConfirmPasswordChange(value: string): void {
    this.formData.confirmPassword = value;
    this.validateStep2(); // Validate step2 whenever confirmPassword changes
  }

  validateStep1(): boolean {
    let isValid = true;
    this.fieldErrors.displayName = '';
    this.fieldErrors.email = '';

    if (!this.formData.displayName.trim()) {
      this.fieldErrors.displayName = 'Le nom complet ne peut pas être vide.';
      isValid = false;
    } else if (this.formData.displayName.trim().length < 3) {
      this.fieldErrors.displayName = 'Le nom complet doit comporter au moins 3 caractères.';
      isValid = false;
    }

    if (!this.formData.email.trim()) {
      this.fieldErrors.email = "L'email ne peut pas être vide.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.fieldErrors.email = "Format d'email invalide.";
      isValid = false;
    }
    this.formStepValidity.step1 = isValid;
    return isValid;
  }

  validateStep2(): boolean {
    let isValid = true;
    this.fieldErrors.password = '';
    this.fieldErrors.confirmPassword = '';

    if (!this.formData.password) {
      this.fieldErrors.password = 'Le mot de passe ne peut pas être vide.';
      isValid = false;
    } else if (this.formData.password.length < 8) {
      this.fieldErrors.password = 'Le mot de passe doit comporter au moins 8 caractères.';
      isValid = false;
    } else if (this.passwordStrength.level === 'weak' && this.formData.password.length >=8) {
      // Optionally enforce stronger password than 'weak' if it meets length criteria
      // this.fieldErrors.password = 'Le mot de passe est trop faible.';
      // isValid = false;
    }


    if (!this.formData.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Veuillez confirmer votre mot de passe.';
      isValid = false;
    } else if (this.formData.password !== this.formData.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
      isValid = false;
    }
    this.formStepValidity.step2 = isValid;
    return isValid;
  }

  updatePasswordStrength(password: string): void {
    // Logic from prototype's updatePasswordStrengthMeter
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;

    this.passwordStrength.progress = Math.min(strength, 100); // Cap at 100

    if (strength < 50) {
      this.passwordStrength.level = 'weak';
      this.passwordStrength.text = 'Faible';
      this.passwordStrength.color = 'var(--ion-color-danger)';
    } else if (strength < 75) {
      this.passwordStrength.level = 'medium';
      this.passwordStrength.text = 'Moyen';
      this.passwordStrength.color = 'var(--ion-color-warning)';
    } else {
      this.passwordStrength.level = 'strong';
      this.passwordStrength.text = 'Fort';
      this.passwordStrength.color = 'var(--ion-color-success)';
    }
    if(password.length === 0) {
        this.passwordStrength.progress = 0;
        this.passwordStrength.text = '';
        this.passwordStrength.level = '';
    }
  }

  // --- Account Creation & Navigation ---
  createAccount(): void {
    if (!this.formStepValidity.step1 || !this.formStepValidity.step2) {
        // This should not happen if buttons are correctly disabled
        console.error("Attempted to create account with invalid form steps.");
        return;
    }
    this.isLoading = true;
    console.log('Creating account with data:', {
      displayName: this.formData.displayName,
      email: this.formData.email,
      // password: this.formData.password // Do not log password
    });

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // Assuming success for now
      this.currentStep = 4; // Move to success state
      console.log('Account created successfully (simulated).');
    }, 1500);
  }

  goToLogin(): void {
    console.log('Navigate to Login page');
    // this.router.navigate(['/auth/signin']);
  }

  goToDashboard(): void {
    console.log('Navigate to Dashboard');
    // this.router.navigate(['/tabs/dashboard']); // Or appropriate dashboard route
  }
}
