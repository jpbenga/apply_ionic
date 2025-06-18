import { Routes } from '@angular/router';
import { SigninPageComponent } from './pages/signin-page/signin-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component'; // Import added

export const AUTH_ROUTES: Routes = [
  {
    path: 'signin',
    component: SigninPageComponent
  },
  { // New route for signup
    path: 'signup',
    component: SignupPageComponent
  },
  {
    path: '', // Default route for the auth feature
    redirectTo: 'signin', // Default to signin for users accessing /auth
    pathMatch: 'full'
  }
  // Add other auth-related routes here, like forgot-password, reset-password, etc.
];
