import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone'; // Removed IonHeader, IonToolbar, IonTitle as they are not in the new HTML
import { StyledButtonComponent } from '../../../../components/shared/styled-button/styled-button.component';
import { StyledInputComponent } from '../../../../components/shared/styled-input/styled-input.component'; // Added StyledInputComponent

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonIcon,
    StyledButtonComponent,
    StyledInputComponent
  ]
})
export class OnboardingPage implements OnInit {
  currentSlide = 0;
  slide2ContinueEnabled = false;
  slide3CompleteEnabled = false; // Will be controlled by form validity

  objectivesForm!: FormGroup;

  // Store texts for slides to potentially make it easier to manage/translate later
  slideContent = [
    {
      title: 'Apply postule pour vous, intelligemment',
      subtitle: 'Libérez-vous de la charge mentale de la recherche d\'emploi et concentrez-vous sur la réussite de vos entretiens.',
      illustrationIcon: 'rocket-outline'
    },
    {
      title: 'Importez votre CV principal',
      subtitle: 'Laissez notre IA extraire vos informations pour gagner du temps.',
      illustrationIcon: 'document-attach-outline' // Placeholder, might need actual illustration
    },
    {
      title: 'Quels sont vos objectifs de carrière ?',
      subtitle: 'Aidez-nous à personnaliser votre expérience et à trouver les meilleures opportunités.',
      illustrationIcon: 'locate-outline' // Placeholder
    }
  ];


  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.objectivesForm = this.fb.group({
      targetRoles: ['', [Validators.required, Validators.minLength(3)]],
      targetSectors: ['', [Validators.minLength(2)]], // Optional
      targetLocations: ['', [Validators.minLength(2)]] // Optional
    });

    // Listen to form changes to enable the "Terminer" button on slide 3
    this.objectivesForm.valueChanges.subscribe(() => {
      this.slide3CompleteEnabled = this.objectivesForm.valid;
    });
  }

  showSlide(index: number) {
    this.currentSlide = index;
  }

  nextSlide() {
    if (this.currentSlide < this.slideContent.length - 1) {
      this.showSlide(this.currentSlide + 1);
    }
  }

  goToSlide(index: number) {
    this.showSlide(index);
  }

  skipOnboarding() {
    console.log('Onboarding skipped. Navigating to dashboard.');
    // In a real app, set a flag: this.onboardingService.markAsSkipped();
    this.router.navigateByUrl('/tabs/dashboard');
  }

  skipStep() {
    if (this.currentSlide < this.slideContent.length - 1) {
      this.nextSlide();
    } else {
      this.completeOnboarding(true); // true indicates skipped last step
    }
  }

  // Simulate PDF upload
  uploadPDF() {
    console.log('Simulating PDF upload...');
    // Simulate a delay for upload
    setTimeout(() => {
      console.log('PDF "uploaded" and "processed".');
      this.slide2ContinueEnabled = true;
      // In a real app: trigger actual upload, parse, then enable.
    }, 1500);
  }

  // Simulate LinkedIn import
  importLinkedIn() {
    console.log('Simulating LinkedIn import...');
    setTimeout(() => {
      console.log('LinkedIn data "imported".');
      this.slide2ContinueEnabled = true;
      // In a real app: trigger OAuth, API call, then enable.
    }, 1500);
  }

  getErrorMessage(controlName: string): string {
    const control = this.objectivesForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis.';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Au moins ${requiredLength} caractères.`;
    }
    return '';
  }

  completeOnboarding(skippedLastStep: boolean = false) {
    if (!skippedLastStep && this.objectivesForm.invalid) {
      console.log('Form is invalid. Cannot complete onboarding.');
      // Mark all fields as touched to show errors
      this.objectivesForm.markAllAsTouched();
      return;
    }

    if (skippedLastStep) {
      console.log('Onboarding "completed" (last step skipped). User data (if any from form):', this.objectivesForm.value);
    } else {
      console.log('Onboarding completed with data:', this.objectivesForm.value);
    }
    // TODO: Persist onboarding completion status and form data
    // this.userService.updateProfile(this.objectivesForm.value);
    // this.onboardingService.markAsCompleted();
    this.router.navigateByUrl('/tabs/dashboard');
  }
}
