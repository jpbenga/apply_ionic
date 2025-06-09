import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Ajoutez RouterModule ici
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonText
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth/auth.service';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { logoGoogle } from 'ionicons/icons'; // SUPPRIMÉ

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Ajoutez cette ligne
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonIcon, 
    IonText
  ]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // addIcons({ logoGoogle }); // SUPPRIMÉ
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        await this.authService.signIn(email, password);
        // Redirection vers le tableau de bord à l'intérieur des tabs
        this.router.navigateByUrl('/tabs/dashboard');
      } catch (error: any) {
        this.errorMessage = error.message || 'Une erreur est survenue lors de la connexion';
      }
    }
  }

  async signInWithGoogle() {
    try {
      await this.authService.signInWithGoogle();
      // Redirection vers le tableau de bord à l'intérieur des tabs
      this.router.navigateByUrl('/tabs/dashboard');
    } catch (error: any) {
      this.errorMessage = error.message || 'Une erreur est survenue lors de la connexion avec Google';
    }
  }
}