import { Routes } from '@angular/router';
import { CvBuilderPageComponent } from './pages/cv-builder-page/cv-builder-page.component';

export const CV_BUILDER_ROUTES: Routes = [
  {
    path: '', // Default route for the 'cv-builder' feature
    component: CvBuilderPageComponent
    // title: 'CV Builder IA' // Optional: Route title
  }
  // Future child routes for the CV Builder could be added here, for example:
  // { path: 'templates', component: CvTemplateListComponent },
  // { path: 'editor/:id', component: CvEditorComponent },
];
