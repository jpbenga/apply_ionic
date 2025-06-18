import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';
import { InputComponent } from '../../../../components/shared/input/input.component';
import { TextareaComponent } from '../../../../components/shared/textarea/textarea.component';
import { CardComponent } from '../../../../components/shared/card/card.component';

interface ProcessingProgress {
  analyze: 'pending' | 'in_progress' | 'completed' | 'error';
  optimize: 'pending' | 'in_progress' | 'completed' | 'error';
  generate: 'pending' | 'in_progress' | 'completed' | 'error';
  finalize: 'pending' | 'in_progress' | 'completed' | 'error';
}

@Component({
  selector: 'app-postuler-page',
  templateUrl: './postuler-page.component.html',
  styleUrls: ['./postuler-page.component.scss'],
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
export class PostulerPageComponent implements OnInit {
  currentScreenStep: number = 1; // 1: Input, 2: Processing, 3: Results
  selectedInputMethod: 'text' | 'url' = 'text';
  jobOfferText: string = '';
  jobOfferUrl: string = '';

  isProcessing: boolean = false; // For overall processing state, might overlap with currentScreenStep = 2
  processingProgress: ProcessingProgress = {
    analyze: 'pending',
    optimize: 'pending',
    generate: 'pending',
    finalize: 'pending'
  };
  currentProcessingStepDescription: string = "Analyse de l'offre en cours...";

  // Example result data - this would come from a service or the AI processing
  analysisResult = {
    compatibilityScore: 0,
    keywords: [],
    tone: '',
    missingSkills: []
  };
  cvPreviewUrl: string = ''; // URL or base64 data for PDF preview
  letterPreviewUrl: string = '';

  aiTip: string = "Conseil IA: N'oubliez pas de vérifier les prérequis de l'offre."; // Initial tip

  constructor() { }

  ngOnInit(): void {
    this.updateSidebarProgress(this.currentScreenStep);
    this.updateAiTip();
  }

  selectInputMethod(method: 'text' | 'url'): void {
    this.selectedInputMethod = method;
    this.jobOfferText = ''; // Clear other input
    this.jobOfferUrl = '';
  }

  startAnalysis(): void {
    if (this.selectedInputMethod === 'text' && !this.jobOfferText.trim()) {
      alert("Veuillez saisir le texte de l'offre d'emploi.");
      return;
    }
    if (this.selectedInputMethod === 'url' && !this.jobOfferUrl.trim()) {
      // Basic URL validation could be added here
      alert("Veuillez saisir l'URL de l'offre d'emploi.");
      return;
    }

    console.log('Starting analysis with:', this.selectedInputMethod === 'text' ? this.jobOfferText : this.jobOfferUrl);
    this.currentScreenStep = 2;
    this.isProcessing = true;
    this.updateSidebarProgress(this.currentScreenStep);
    this.simulateAIProcessing();
  }

  simulateAIProcessing(): void {
    this.processingProgress = { analyze: 'pending', optimize: 'pending', generate: 'pending', finalize: 'pending' };
    const steps: Array<keyof ProcessingProgress> = ['analyze', 'optimize', 'generate', 'finalize'];
    const descriptions = [
      "Analyse de l'offre et de votre profil...",
      "Optimisation de votre CV pour cette offre...",
      "Génération d'une lettre de motivation percutante...",
      "Finalisation et vérification de la compatibilité..."
    ];
    let currentStepIndex = 0;

    const processNextStep = () => {
      if (currentStepIndex < steps.length) {
        const stepKey = steps[currentStepIndex];
        this.processingProgress[stepKey] = 'in_progress';
        this.currentProcessingStepDescription = descriptions[currentStepIndex];

        setTimeout(() => {
          this.processingProgress[stepKey] = 'completed';
          currentStepIndex++;
          this.updateAiTip(); // Update tip as processing progresses
          processNextStep();
        }, 1500); // Simulate time for each step
      } else {
        this.isProcessing = false;
        this.currentScreenStep = 3;
        this.updateSidebarProgress(this.currentScreenStep);
        this.populateResults(); // Populate with example results
        console.log('AI Processing Complete.');
      }
    };
    processNextStep();
  }

  populateResults(): void {
    this.analysisResult = {
      compatibilityScore: 88,
      keywords: ['Gestion de projet Agile', 'Expérience SaaS', 'Leadership', 'Communication'],
      tone: 'Professionnel et direct',
      missingSkills: ['Certification PMP (souhaité)']
    };
    // Simulate PDF URLs or data for previews
    this.cvPreviewUrl = '/assets/sample-cv.pdf'; // Placeholder
    this.letterPreviewUrl = '/assets/sample-letter.pdf'; // Placeholder
    this.updateAiTip();
  }

  previewDocument(type: string): void {
    console.log(`Preview document: ${type}`);
    // Logic to show a modal or navigate to a preview page
    // For iframes, you might set a URL like:
    // window.open(type === 'cv' ? this.cvPreviewUrl : this.letterPreviewUrl, '_blank');
  }

  downloadDocuments(): void {
    console.log('Download all documents');
    // Logic to trigger download of a zip file or individual files
  }

  saveApplication(): void {
    console.log('Save application');
    // Logic to save the generated application details
  }

  // --- Sidebar specific logic ---
  updateSidebarProgress(step: number): void {
    // This method would interact with the DOM or child components if sidebar was complex.
    // For now, it's a placeholder for logic controlling sidebar visual state.
    console.log(`Updating sidebar progress for screen step: ${step}`);
  }

  updateAiTip(): void {
    const tips = [
      "Conseil IA: Adaptez votre CV pour chaque offre, même les plus similaires.",
      "Conseil IA: Une lettre de motivation personnalisée fait souvent la différence.",
      "Conseil IA: Utilisez les mots-clés de l'offre dans votre CV et lettre.",
      "Conseil IA: Préparez des exemples concrets pour illustrer vos compétences en entretien."
    ];
    if (this.currentScreenStep === 3) {
        this.aiTip = `Score de compatibilité: ${this.analysisResult.compatibilityScore}%. Pensez à mettre en avant les mots-clés trouvés.`;
    } else if (this.isProcessing) {
        this.aiTip = "L'IA travaille pour vous. Un instant s'il vous plaît...";
    }
     else {
      this.aiTip = tips[Math.floor(Math.random() * tips.length)];
    }
  }

  // Helper to get object keys for ngFor in template if needed for progress steps
  objectKeys(obj: any) {
    return Object.keys(obj) as Array<keyof ProcessingProgress>;
  }
}
