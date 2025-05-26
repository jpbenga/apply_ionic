import { Routes } from '@angular/router';
import { map } from 'rxjs/operators';
import { authState } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';

const redirectUnauthorizedToLogin = () => {
  const auth = inject(Auth);
  return authState(auth).pipe(
    map(user => user ? true : ['login'])
  );
};

const redirectLoggedInToHome = () => {
  const auth = inject(Auth);
  return authState(auth).pipe(
    map(user => !user ? true : ['tabs', 'dashboard'])
  );
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
    canActivate: [redirectLoggedInToHome]
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup.page').then(m => m.SignupPage),
    canActivate: [redirectLoggedInToHome]
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [redirectUnauthorizedToLogin],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'postuler',
        loadComponent: () => import('./pages/postuler/postuler.page').then(m => m.PostulerPage)
      },
      {
        path: 'stats',
        loadComponent: () => import('./pages/stats/stats.page').then(m => m.StatsPage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [redirectUnauthorizedToLogin]
  },
  {
    path: 'candidature/:id',
    loadComponent: () => import('./pages/dashboard/candidature-detail/candidature-detail.page').then(m => m.CandidatureDetailPage),
    canActivate: [redirectUnauthorizedToLogin]
  },
  {
    path: 'my-cv', // Nouvelle route pour le CV structuré
    loadComponent: () => import('./pages/my-cv/my-cv.page').then(m => m.MyCvPage),
    canActivate: [redirectUnauthorizedToLogin] // Protéger cette route
  },
  {
    path: 'my-cv',
    loadComponent: () => import('./pages/my-cv/my-cv.page').then( m => m.MyCvPage)
  }
];