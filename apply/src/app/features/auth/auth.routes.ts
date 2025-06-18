import { Routes } from '@angular/router';
import { SigninPageComponent } from './pages/signin-page/signin-page.component';
// Import SignupPageComponent here when it's created, e.g.:
// import { SignupPageComponent } from './pages/signup-page/signup-page.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'signin',
    component: SigninPageComponent
  },
  // Example placeholder for a signup route:
  // {
  //   path: 'signup',
  //   component: SignupPageComponent
  // },
  {
    path: '', // Default route for the auth feature
    redirectTo: 'signin', // Redirects /auth to /auth/signin
    pathMatch: 'full'
  }
  // Add other auth-related routes here, like forgot-password, reset-password, etc.
];
