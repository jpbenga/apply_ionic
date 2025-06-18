import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../../../components/shared/logo/logo.component';
import { ButtonComponent } from '../../../../components/shared/button/button.component';

@Component({
  selector: 'app-onboarding-step-one',
  templateUrl: './onboarding-step-one.component.html',
  styleUrls: ['./onboarding-step-one.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LogoComponent, ButtonComponent]
})
export class OnboardingStepOneComponent {
  @Output() nextClicked = new EventEmitter<void>();
  @Output() skipClicked = new EventEmitter<void>();

  constructor() { }

  next(): void {
    console.log('Next button clicked on Onboarding Step One');
    this.nextClicked.emit();
  }

  skip(): void {
    console.log('Skip button clicked on Onboarding Step One');
    this.skipClicked.emit();
  }
}
