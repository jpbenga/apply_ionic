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
    canActivate: [redirectLoggedInToHome],
    data: { title: 'Connexion', showBackButton: false }
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup.page').then(m => m.SignupPage),
    canActivate: [redirectLoggedInToHome],
    data: { title: 'Inscription', showBackButton: true }
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [redirectUnauthorizedToLogin],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
        data: { title: 'Tableau de Bord', showBackButton: false }
      },
      {
        path: 'postuler',
        loadComponent: () => import('./pages/postuler/postuler.page').then(m => m.PostulerPage),
        data: { title: 'Postuler', showBackButton: false }
      },
      {
        path: 'stats',
        loadComponent: () => import('./pages/stats/stats.page').then(m => m.StatsPage),
        data: { title: 'Statistiques', showBackButton: false }
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
    canActivate: [redirectUnauthorizedToLogin],
    data: { title: 'Mon Profil', showBackButton: true }
  },
  {
    path: 'candidature/:id',
    loadComponent: () => import('./pages/dashboard/candidature-detail/candidature-detail.page').then(m => m.CandidatureDetailPage),
    canActivate: [redirectUnauthorizedToLogin],
    data: { title: 'Détail Candidature', showBackButton: true } 
  },
  {
    path: 'my-cv',
    loadComponent: () => import('./pages/my-cv/my-cv.page').then(m => m.MyCvPage),
    canActivate: [redirectUnauthorizedToLogin],
    data: { title: 'Mon CV Structuré', showBackButton: true }
  }
];