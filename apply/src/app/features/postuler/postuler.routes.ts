import { Routes } from '@angular/router';
import { PostulerPageComponent } from './pages/postuler-page/postuler-page.component';

export const POSTULER_ROUTES: Routes = [
  {
    path: '', // Default route for the 'postuler' feature
    component: PostulerPageComponent
    // title: 'Postuler avec IA' // Optional: Route title
  }
  // If the "Postuler" feature had sub-sections navigated by URL,
  // they could be defined as child routes here. For example:
  // { path: 'history', component: ApplicationHistoryComponent },
  // { path: 'templates', component: TemplateManagerComponent },
];
