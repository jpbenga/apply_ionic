import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // For ion-searchbar, ion-fab, ion-icon etc.
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';
import { CardComponent } from '../../../../components/shared/card/card.component';
import { InputComponent } from '../../../../components/shared/input/input.component'; // If using app-input for search

// Interface for Application (simplified from prototype)
interface Application {
  id: string;
  title: string;
  company: string;
  status: string; // e.g., 'En cours', 'Entretien planifié', 'Offre reçue'
  statusColor: string; // e.g., 'var(--ion-color-primary)'
  dateApplied: string;
  aiMatch: number; // Percentage
  keywords?: string[];
  nextStep?: string;
  logoUrl?: string; // Company logo
}

// Interface for Metric
interface Metric {
  value: string;
  label: string;
  icon: string; // ion-icon name
  colorClass: string; // e.g., 'metric-primary'
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogoComponent,
    ButtonComponent,
    CardComponent,
    InputComponent // Add if app-input is used for search
  ]
})
export class DashboardPageComponent implements OnInit {
  userName: string = 'John'; // Example user name

  heroStats = {
    applicationsSent: 23,
    interviewsScheduled: 7,
    offersReceived: 2
  };

  metrics: Metric[] = [
    { value: '88%', label: 'Compatibilité IA moyenne', icon: 'sparkles-outline', colorClass: 'metric-primary' },
    { value: '12 jours', label: 'Temps moyen / candidature', icon: 'time-outline', colorClass: 'metric-secondary' },
    { value: '65%', label: 'Taux de réponse positif', icon: 'trending-up-outline', colorClass: 'metric-success' },
    { value: '+15%', label: 'Optimisation / CV standards', icon: 'rocket-outline', colorClass: 'metric-warning' }
  ];

  allApplications: Application[] = [ // Sample data based on prototype context
    { id: '1', title: 'Product Manager Senior', company: 'TechSolutions Inc.', status: 'Entretien planifié', statusColor: 'var(--ion-color-warning)', dateApplied: '15 Juillet', aiMatch: 92, keywords: ['Agile', 'SaaS', 'Roadmap'], nextStep: 'Entretien Tech - 25 Juil', logoUrl: '/assets/company-logos/techsolutions.png' },
    { id: '2', title: 'UX Designer Lead', company: 'Innovatech Ltd.', status: 'Offre reçue', statusColor: 'var(--ion-color-success)', dateApplied: '10 Juillet', aiMatch: 85, keywords: ['Figma', 'User Research', 'Prototyping'], nextStep: 'Réponse offre - 22 Juil', logoUrl: '/assets/company-logos/innovatech.png' },
    { id: '3', title: 'Développeur Fullstack', company: 'WebServices Co.', status: 'En attente de réponse', statusColor: 'var(--ion-color-medium)', dateApplied: '18 Juillet', aiMatch: 78, keywords: ['Angular', 'Node.js', 'MongoDB'], nextStep: 'Suivi le 28 Juil', logoUrl: '/assets/company-logos/webservices.png' },
    { id: '4', title: 'Chef de Projet Digital', company: 'MarketingMasters', status: 'Candidature envoyée', statusColor: 'var(--ion-color-primary)', dateApplied: '20 Juillet', aiMatch: 95, keywords: ['SEO', 'Content Strategy', 'Analytics'], nextStep: 'Confirmation de réception', logoUrl: '/assets/company-logos/marketingmasters.png' }
  ];

  activeFilters: string[] = ['all'];
  searchTerm: string = '';

  viewMode: 'grid' | 'list' = 'grid'; // For app view toggle

  constructor() { }

  ngOnInit(): void {
    // Initial data load or setup can go here
  }

  get filteredApplications(): Application[] {
    let apps = this.allApplications;
    if (!this.activeFilters.includes('all')) {
      apps = apps.filter(app => this.activeFilters.includes(app.status.toLowerCase().replace(/\s+/g, '-')));
    }
    if (this.searchTerm.trim() !== '') {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      apps = apps.filter(app =>
        app.title.toLowerCase().includes(lowerSearchTerm) ||
        app.company.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return apps;
  }

  showOpportunities(): void {
    console.log('Show new opportunities clicked');
    // Potentially navigate to a "new opportunities" page or open a modal
  }

  filterByStatus(status: string): void {
    if (status === 'all') {
      this.activeFilters = ['all'];
    } else {
      this.activeFilters = this.activeFilters.filter(f => f !== 'all'); // Remove 'all' if other filter is chosen
      if (this.activeFilters.includes(status)) {
        this.activeFilters = this.activeFilters.filter(f => f !== status); // Toggle off
        if (this.activeFilters.length === 0) this.activeFilters = ['all']; // If no filters, show all
      } else {
        this.activeFilters.push(status); // Toggle on
      }
    }
    console.log('Active filters:', this.activeFilters);
  }

  isFilterActive(status: string): boolean {
    return this.activeFilters.includes(status);
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value || '';
  }

  viewApplication(appId: string): void {
    console.log('View application details for:', appId);
    // Navigate to application detail page or show modal
  }

  createNewApplication(): void {
    console.log('Create new application (FAB clicked)');
    // Navigate to Postuler page or open modal
    // this.router.navigate(['/postuler']);
  }

  toggleViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Placeholder for user profile action
  openProfileSettings(): void {
    console.log('Open user profile settings');
  }
}
