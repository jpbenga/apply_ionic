import { Routes } from '@angular/router';
import { map } from 'rxjs/operators';
import { authState } from '@angular/fire/auth'; // Auth and inject are already imported by the new guards
// import { Auth } from '@angular/fire/auth'; // No longer needed directly here
// import { inject } from '@angular/core'; // No longer needed directly here
import { redirectUnauthorizedToLoginGuard } from './features/auth/guards/redirect-unauthorized-to-login.guard';
import { redirectLoggedInToHomeGuard } from './features/auth/guards/redirect-logged-in-to-home.guard';

// const redirectUnauthorizedToLogin = () => { // SUPPRIMÉ
//   const auth = inject(Auth);
//   const router = inject(Router);
//   return authState(auth).pipe(
//     map(user => {
//       if (user) {
//         return true;
//       } else {
//         return router.createUrlTree(['/login']);
//       }
//     })
//   );
// };

// const redirectLoggedInToHome = () => { // SUPPRIMÉ
//   const auth = inject(Auth);
//   const router = inject(Router);
//   return authState(auth).pipe(
//     map(user => {
//       if (!user) {
//         return true;
//       } else {
//         return router.createUrlTree(['/tabs/dashboard']);
//       }
//     })
//   );
// };

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.page').then(m => m.LoginPage),
    canActivate: [redirectLoggedInToHomeGuard], // MODIFIÉ
    data: { title: 'Connexion', showBackButton: false }
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/pages/signup/signup.page').then(m => m.SignupPage),
    canActivate: [redirectLoggedInToHomeGuard], // MODIFIÉ
    data: { title: 'Inscription', showBackButton: true }
  },
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/pages/tabs.page').then(m => m.TabsPage), // MODIFIED
    canActivate: [redirectUnauthorizedToLoginGuard], // MODIFIÉ
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/candidatures/pages/dashboard/dashboard.page').then(m => m.DashboardPage), // MODIFIED
        data: { title: 'Tableau de Bord', showBackButton: false }
      },
      {
        path: 'postuler',
        loadComponent: () => import('./features/candidatures/pages/postuler/postuler.page').then(m => m.PostulerPage), // MODIFIED
        data: { title: 'Postuler', showBackButton: false }
      },
      // Route pour 'stats' supprimée
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/pages/profile.page').then(m => m.ProfilePage),
    canActivate: [redirectUnauthorizedToLoginGuard], // MODIFIÉ
    data: { title: 'Mon Profil', showBackButton: true }
  },
  {
    path: 'candidature/:id',
    loadComponent: () => import('./features/candidatures/pages/dashboard/candidature-detail/candidature-detail.page').then(m => m.CandidatureDetailPage), // MODIFIED
    canActivate: [redirectUnauthorizedToLoginGuard], // MODIFIÉ
    data: { title: 'Détail Candidature', showBackButton: true } 
  },
  {
    path: 'my-cv',
    loadComponent: () => import('./pages/my-cv/my-cv.page').then(m => m.MyCvPage),
    canActivate: [redirectUnauthorizedToLoginGuard], // MODIFIÉ
    data: { title: 'Mon CV Structuré', showBackButton: true }
  }
];