// src/app/app.routes.ts
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
    map(user => !user ? true : ['home'])
  );
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [redirectLoggedInToHome]
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then(m => m.SignupPage),
    canActivate: [redirectLoggedInToHome]
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [redirectUnauthorizedToLogin]
  },
];