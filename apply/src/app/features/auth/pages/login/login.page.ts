import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, IonIcon, IonSpinner // Keep only what's needed
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';
import { StyledInputComponent } from '../../../../components/shared/styled-input/styled-input.component';
import { StyledButtonComponent } from '../../../../components/shared/styled-button/styled-button.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonSpinner, // Added for loading indicator
    StyledInputComponent,
    StyledButtonComponent
  ]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = ''; // Added
  isLoading: boolean = false;   // Added

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (!this.loginForm.valid) {
      // Mark all fields as touched to display errors if using app-styled-input's error display
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);
      this.successMessage = 'Connexion réussie ! Redirection...';
      // Redirection vers le tableau de bord à l'intérieur des tabs
      // The actual navigation is handled by the auth guard/service after successful login state is confirmed
      // For now, let's assume successful signIn will trigger global auth state change and guards will redirect.
      // If not, redirect here:
      setTimeout(() => this.router.navigateByUrl('/tabs/dashboard'), 1000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Email ou mot de passe incorrect.';
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.signInWithGoogle();
      this.successMessage = 'Connexion avec Google réussie ! Redirection...';
      // Similar to onSubmit, auth state change should ideally handle redirection.
      setTimeout(() => this.router.navigateByUrl('/tabs/dashboard'), 1000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Une erreur est survenue lors de la connexion avec Google.';
    } finally {
      this.isLoading = false;
    }
  }

  forgotPassword() {
    console.log('Forgot password clicked');
    // Implement navigation to a password reset page or modal
    this.errorMessage = 'Fonctionnalité de mot de passe oublié à implémenter.';
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.hasError('required')) {
        return 'Ce champ est requis.';
      }
      if (control.hasError('email')) {
        return 'Veuillez saisir une adresse email valide.';
      }
      if (control.hasError('minlength')) {
        const requiredLength = control.getError('minlength').requiredLength;
        return `Au moins ${requiredLength} caractères.`;
      }
    }
    return '';
  }
}