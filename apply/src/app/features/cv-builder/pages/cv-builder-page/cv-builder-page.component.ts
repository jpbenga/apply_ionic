import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';
import { InputComponent } from '../../../../components/shared/input/input.component';
import { TextareaComponent } from '../../../../components/shared/textarea/textarea.component';
import { CardComponent } from '../../../../components/shared/card/card.component';

interface CvProcessingProgress {
  analyseOffre: 'pending' | 'in_progress' | 'completed';
  analyseCV: 'pending' | 'in_progress' | 'completed';
  optimisationCV: 'pending' | 'in_progress' | 'completed';
  generationLettre: 'pending' | 'in_progress' | 'completed';
}

@Component({
  selector: 'app-cv-builder-page',
  templateUrl: './cv-builder-page.component.html',
  styleUrls: ['./cv-builder-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogoComponent,
    ButtonComponent,
    InputComponent,
    TextareaComponent,
    CardComponent
  ]
})
export class CvBuilderPageComponent implements OnInit {
  currentCvStep: number = 1; // 1: Input, 2: Processing, 3: Results
  selectedInputMethod: 'text' | 'url' = 'text';
  jobDescriptionText: string = '';
  jobDescriptionUrl: string = '';

  // AI Processing state
  isProcessing: boolean = false;
  currentProcessingMessage: string = "Analyse de l'offre en cours...";
  processingProgress: CvProcessingProgress = {
    analyseOffre: 'pending',
    analyseCV: 'pending',
    optimisationCV: 'pending',
    generationLettre: 'pending'
  };
  overallProgressPercent: number = 0;


  // Example results data
  analysisData = {
    compatibilityScore: 0,
    matchingKeywords: [],
    missingKeywords: [],
    toneAnalysis: ''
  };
  cvPreviewUrl: string = ''; // Placeholder
  letterPreviewUrl: string = ''; // Placeholder

  userName: string = "Utilisateur"; // Example

  constructor() { }

  ngOnInit(): void { }

  selectInputMethod(method: 'text' | 'url'): void {
    this.selectedInputMethod = method;
    this.jobDescriptionText = ''; // Clear other input
    this.jobDescriptionUrl = '';
  }

  startAIAnalysis(): void {
    if (this.selectedInputMethod === 'text' && !this.jobDescriptionText.trim()) {
      alert("Veuillez saisir le texte de l'offre d'emploi.");
      return;
    }
    if (this.selectedInputMethod === 'url' && !this.jobDescriptionUrl.trim()) {
      alert("Veuillez saisir l'URL de l'offre d'emploi.");
      return;
    }
    console.log('Starting AI analysis for CV Builder...');
    this.currentCvStep = 2;
    this.isProcessing = true;
    this.simulateProcessing();
  }

  async simulateProcessing(): Promise<void> {
    this.processingProgress = { analyseOffre: 'pending', analyseCV: 'pending', optimisationCV: 'pending', generationLettre: 'pending' };
    this.overallProgressPercent = 0;

    const steps: Array<keyof CvProcessingProgress> = ['analyseOffre', 'analyseCV', 'optimisationCV', 'generationLettre'];
    const messages = [
      "Analyse de l'offre d'emploi...",
      "Analyse de votre CV actuel...",
      "Optimisation du CV par l'IA...",
      "Génération de la lettre de motivation..."
    ];

    for (let i = 0; i < steps.length; i++) {
      const stepKey = steps[i];
      this.processingProgress[stepKey] = 'in_progress';
      this.currentProcessingMessage = messages[i];
      this.overallProgressPercent = (i / steps.length) * 100; // Update overall progress before delay
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      this.processingProgress[stepKey] = 'completed';
    }

    this.overallProgressPercent = 100;
    this.currentProcessingMessage = "Finalisation des documents...";
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.isProcessing = false;
    this.currentCvStep = 3;
    this.populateResults(); // Populate with example results
    console.log('CV Builder AI Processing Complete.');
  }

  populateResults(): void {
    this.analysisData = {
      compatibilityScore: 92,
      matchingKeywords: ['Gestion de projet', 'Méthodologie Agile', 'Communication', 'Leadership'],
      missingKeywords: ['Certification PMP', 'Expérience SaaS B2B'],
      toneAnalysis: 'Professionnel et dynamique'
    };
    this.cvPreviewUrl = '/assets/sample-cv-optimized.pdf'; // Placeholder
    this.letterPreviewUrl = '/assets/sample-letter-generated.pdf'; // Placeholder
  }

  downloadDocuments(): void {
    console.log('Download documents triggered');
    // Actual download logic here
  }

  saveApplication(): void {
    console.log('Save application triggered');
    // Actual save logic here
  }

  // Helper for ngFor in template
  objectKeys(obj: any) {
    return Object.keys(obj) as Array<keyof CvProcessingProgress>;
  }
}
