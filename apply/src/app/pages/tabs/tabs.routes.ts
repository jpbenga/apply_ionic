// src/app/pages/tabs/tabs.routes.ts
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'postuler',
        loadComponent: () => import('../postuler/postuler.page').then(m => m.PostulerPage)
      },
      {
        path: 'stats',
        loadComponent: () => import('../stats/stats.page').then(m => m.StatsPage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];