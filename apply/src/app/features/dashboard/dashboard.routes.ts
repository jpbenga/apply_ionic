import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '', // Default route for the 'dashboard' feature
    component: DashboardPageComponent
    // title: 'Tableau de Bord' // Optional: Route title for browser tab/history
  }
  // Future child routes for the dashboard could be added here, for example:
  // { path: 'settings', component: DashboardSettingsComponent },
  // { path: 'reports/:id', component: DetailedReportComponent },
];
