import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Import Location
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';
import { CardComponent } from '../../../../components/shared/card/card.component';
import { InputComponent } from '../../../../components/shared/input/input.component';
import { TextareaComponent } from '../../../../components/shared/textarea/textarea.component';

interface UserProfile {
  displayName: string;
  title: string;
  email: string;
  phone?: string;
  address?: string;
  summary?: string;
  avatarUrl?: string;
  // Add other fields as needed from prototype (experience, education, skills)
  professionalTitle?: string;
  currentCompany?: string;
  linkedinProfile?: string;
  portfolioUrl?: string;
}

interface ProfileSection {
  id: string;
  title: string;
  icon: string;
  completionPercent: number; // 0-100
  fields: Array<{ key: keyof UserProfile; label: string; type: 'text' | 'textarea' | 'email' | 'tel' | 'url'; placeholder?: string }>;
}

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogoComponent,
    ButtonComponent,
    CardComponent,
    InputComponent,
    TextareaComponent
  ]
})
export class ProfilePageComponent implements OnInit {
  userProfileData: UserProfile = {
    displayName: 'John Doe',
    title: 'Product Manager Senior',
    email: 'john.doe@example.com',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de Rivoli, 75001 Paris',
    summary: "Manager de produit expérimenté avec 8+ années d'expérience dans la tech. Passionné par la création de produits SaaS innovants et l'optimisation de l'expérience utilisateur. Expert en méthodologies Agile et Scrum.",
    avatarUrl: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=JD', // Placeholder
    professionalTitle: 'Product Manager Senior',
    currentCompany: 'TechSolutions Inc.',
    linkedinProfile: 'linkedin.com/in/johndoe',
    portfolioUrl: 'johndoe.dev'
  };

  // Calculated based on filled fields in userProfileData
  profileCompletionPercent: number = 0;

  impactStats = {
    applicationsSent: 128,
    interviewsObtained: 24,
    timeSavedHours: 110
  };

  tipContent = {
    title: "Optimisez votre résumé",
    description: "Un résumé percutant est la clé pour capter l'attention des recruteurs. Mettez en avant vos succès clés et compétences uniques."
  };

  isModalOpen: boolean = false;
  // Use a deep copy for editing to avoid modifying original data until save
  editingSectionData: Partial<UserProfile> = {};

  // Configuration for profile sections and their fields for the modal
  profileSectionsConfig: ProfileSection[] = [
    {
      id: 'personal', title: 'Informations Personnelles', icon: 'person-circle-outline', completionPercent: 0,
      fields: [
        { key: 'displayName', label: 'Nom complet', type: 'text', placeholder: 'Ex: Jean Dupont' },
        { key: 'professionalTitle', label: 'Titre professionnel', type: 'text', placeholder: 'Ex: Product Manager Senior' },
        { key: 'currentCompany', label: 'Entreprise actuelle (optionnel)', type: 'text', placeholder: 'Ex: TechSolutions Inc.' },
      ]
    },
    {
      id: 'contact', title: 'Coordonnées', icon: 'call-outline', completionPercent: 0,
      fields: [
        { key: 'email', label: 'Adresse email', type: 'email', placeholder: 'Ex: votre@email.com' },
        { key: 'phone', label: 'Téléphone (optionnel)', type: 'tel', placeholder: 'Ex: +33 6 12 34 56 78' },
        { key: 'address', label: 'Adresse (optionnel)', type: 'text', placeholder: 'Ex: 123 Rue de Rivoli, Paris' },
      ]
    },
    {
      id: 'professionalLinks', title: 'Liens Professionnels', icon: 'link-outline', completionPercent: 0,
      fields: [
        { key: 'linkedinProfile', label: 'Profil LinkedIn (optionnel)', type: 'url', placeholder: 'Ex: linkedin.com/in/votrenom' },
        { key: 'portfolioUrl', label: 'Portfolio / Site Web (optionnel)', type: 'url', placeholder: 'Ex: votresite.com' },
      ]
    },
    {
      id: 'summary', title: 'Résumé Professionnel', icon: 'document-text-outline', completionPercent: 0,
      fields: [
        { key: 'summary', label: 'Votre résumé', type: 'textarea', placeholder: 'Décrivez votre parcours, vos compétences clés et vos aspirations...' },
      ]
    }
    // Add Experience, Education, Skills sections here later
  ];

  expandedSections: { [key: string]: boolean } = { personal: true, contact: false, professionalLinks: false, summary: false };

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.calculateProfileCompletion();
    this.updateSectionsCompletion();
  }

  calculateProfileCompletion(): void {
    const fieldsToConsider: Array<keyof UserProfile> = ['displayName', 'professionalTitle', 'email', 'summary', 'linkedinProfile'];
    let filledFields = 0;
    fieldsToConsider.forEach(field => {
      if (this.userProfileData[field] && String(this.userProfileData[field]).trim() !== '') {
        filledFields++;
      }
    });
    this.profileCompletionPercent = Math.round((filledFields / fieldsToConsider.length) * 100);
  }

  updateSectionsCompletion(): void {
    this.profileSectionsConfig.forEach(section => {
        let filledFieldsInSection = 0;
        let totalFieldsInSection = section.fields.length;
        if (totalFieldsInSection === 0) {
            section.completionPercent = 100; // Or 0 if preferred for empty sections
            return;
        }
        section.fields.forEach(field => {
            if(this.userProfileData[field.key] && String(this.userProfileData[field.key]).trim() !== '') {
                filledFieldsInSection++;
            }
        });
        section.completionPercent = Math.round((filledFieldsInSection / totalFieldsInSection) * 100);
    });
  }

  toggleSection(sectionId: string): void {
    this.expandedSections[sectionId] = !this.expandedSections[sectionId];
  }

  openEditModal(sectionIdToEdit?: string): void {
    // For simplicity, modal will always edit all fields defined in profileSectionsConfig
    // but could be tailored if sectionIdToEdit was used to filter fields shown in modal
    this.editingSectionData = { ...this.userProfileData }; // Create a shallow copy for editing
    this.isModalOpen = true;
  }

  closeEditModal(): void {
    this.isModalOpen = false;
    this.editingSectionData = {}; // Clear editing data
  }

  saveProfileChanges(): void {
    console.log('Saving profile changes:', this.editingSectionData);
    this.userProfileData = { ...this.userProfileData, ...this.editingSectionData };
    // Simulate API save
    setTimeout(() => {
      this.calculateProfileCompletion();
      this.updateSectionsCompletion();
      this.closeEditModal();
      console.log('Profile saved successfully.');
    }, 500);
  }

  handleAvatarUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('Avatar file selected:', file.name);
      // Simulate upload and get URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editingSectionData.avatarUrl = e.target.result; // For preview in modal
        // In a real app, upload to server and get back a URL to store in userProfileData on save
      };
      reader.readAsDataURL(file);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
