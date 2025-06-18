// src/app/pages/auth/signup/signup.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonSpinner, IonBackButton, IonButtons, IonIcon
} from '@ionic/angular/standalone'; // Removed IonItem, IonLabel, IonInput, IonButton, IonText, IonCard, IonCardContent
import { AuthService } from '../../services/auth/auth.service';
import { StyledInputComponent } from '../../../../components/shared/styled-input/styled-input.component';
import { StyledButtonComponent } from '../../../../components/shared/styled-button/styled-button.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonSpinner,
    IonBackButton,
    IonButtons,
    IonIcon,
    StyledInputComponent, // Added
    StyledButtonComponent // Added
  ]
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async onSubmit() {
    if (!this.signupForm.valid) { // Ensure this is checked first
      this.signupForm.markAllAsTouched(); // Mark all fields as touched
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    // this.successMessage = ''; // Keep success message until redirection or if error occurs
      
    try {
      const { email, password, displayName } = this.signupForm.value;
      await this.authService.signUp(email, password, displayName);
        
      this.successMessage = 'Votre compte a été créé avec succès !';
      this.errorMessage = ''; // Clear any previous error
        
      setTimeout(() => {
        this.router.navigateByUrl('/onboarding');
      }, 2000);
        
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Cette adresse email est déjà utilisée.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Le mot de passe est trop faible.';
      } else {
        this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription.';
      }
      this.successMessage = ''; // Clear success message on error
    } finally {
      this.isLoading = false;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (!control || !control.touched) { // Only show error if touched
      return '';
    }
    if (control.hasError('required')) {
      return 'Ce champ est requis.';
    }
    if (control.hasError('email')) {
      return 'Veuillez saisir une adresse email valide.';
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `Doit contenir au moins ${requiredLength} caractères.`;
    }
    // For confirmPassword, check overall form error if control itself is valid but mismatch exists
    if (controlName === 'confirmPassword' && !control.hasError('required') && this.signupForm.hasError('mismatch')) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return '';
  }
}