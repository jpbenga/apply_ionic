// src/app/components/cv-templates/template-modern/cv-template-modern.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplateBaseComponent } from '../base/cv-template-base.component';

@Component({
  selector: 'app-cv-template-modern',
  templateUrl: './cv-template-modern.component.html',
  styleUrls: ['./cv-template-modern.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CvTemplateModernComponent extends CvTemplateBaseComponent {
  
}