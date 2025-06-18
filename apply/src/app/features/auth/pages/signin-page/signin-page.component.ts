import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngSubmit if used, and potentially ngModel
import { IonicModule } from '@ionic/angular'; // For ion-icon and ion-content
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';
import { InputComponent } from '../../../../components/shared/input/input.component';
// Assuming Router will be used later for actual navigation
// import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.scss'],
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
export class SigninPageComponent {
  formValues = {
    email: '',
    password: ''
  };
  isLoading: boolean = false;
  errorMessage?: string;
  successMessage?: string;

  // constructor(private router: Router) { }
  constructor() { }

  handleLogin(): void {
    this.isLoading = true;
    this.errorMessage = undefined;
    this.successMessage = undefined;
    console.log('Attempting login with:', this.formValues);

    // Basic validation example
    if (!this.formValues.email || !this.isValidEmail(this.formValues.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide.';
      this.isLoading = false;
      return;
    }
    if (!this.formValues.password) {
      this.errorMessage = 'Veuillez entrer votre mot de passe.';
      this.isLoading = false;
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (this.formValues.email === 'test@example.com' && this.formValues.password === 'password') {
        this.successMessage = 'Connexion réussie! Redirection vers le tableau de bord...';
        this.isLoading = false;
        console.log('Login successful, navigate to dashboard.');
        // this.router.navigate(['/tabs/dashboard']);
      } else {
        this.errorMessage = 'Email ou mot de passe incorrect.';
        this.isLoading = false;
      }
    }, 1500);
  }

  signInWithGoogle(): void {
    console.log('signInWithGoogle clicked');
    this.isLoading = true;
    // Simulate Google Sign-In
    setTimeout(() => {
      this.successMessage = 'Connecté avec Google! Redirection...';
      this.isLoading = false;
      console.log('Google sign-in successful, navigate to dashboard.');
      // this.router.navigate(['/tabs/dashboard']);
    }, 1000);
  }

  showForgotPassword(): void {
    console.log('Forgot password clicked');
    // Logic for forgot password (e.g., show modal)
  }

  goToSignup(): void {
    console.log('Navigate to Signup page');
    // this.router.navigate(['/auth/signup']);
  }

  private isValidEmail(email: string): boolean {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
