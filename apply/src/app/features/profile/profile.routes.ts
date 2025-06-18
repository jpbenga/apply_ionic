import { Routes } from '@angular/router';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '', // Default route for the 'profile' feature
    component: ProfilePageComponent
    // title: 'Mon Profil' // Optional: Route title
  }
  // Future child routes for the profile feature could include:
  // { path: 'settings', component: ProfileSettingsComponent },
  // { path: 'notifications', component: NotificationPreferencesComponent },
  // { path: 'documents', component: MyDocumentsComponent },
];
