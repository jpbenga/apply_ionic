// src/app/pages/auth/signup/signup.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, 
  IonText, IonSpinner, IonBackButton, IonButtons,
  IonCard, IonCardContent, IonIcon
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service'; // MODIFIED
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { checkmarkCircleOutline } from 'ionicons/icons'; // SUPPRIMÉ

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
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonText,
    IonSpinner,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonIcon
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
  ) {
    // addIcons({ checkmarkCircleOutline }); // SUPPRIMÉ
  }

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
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const { email, password, displayName } = this.signupForm.value;
        await this.authService.signUp(email, password, displayName);
        
        // Afficher message de succès
        this.successMessage = 'Votre compte a été créé avec succès !';
        
        // Attendre un court instant pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          // Rediriger vers le dashboard
          this.router.navigateByUrl('/tabs/dashboard');
        }, 2000);
        
      } catch (error: any) {
        // Gérer les erreurs spécifiques
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'Cette adresse email est déjà utilisée.';
        } else if (error.code === 'auth/weak-password') {
          this.errorMessage = 'Le mot de passe est trop faible.';
        } else {
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
        }
        
        this.isLoading = false;
      }
    } else {
      // Marque tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}