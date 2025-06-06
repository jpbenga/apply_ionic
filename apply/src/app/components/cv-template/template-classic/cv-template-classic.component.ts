// src/app/components/cv-templates/template-classic/cv-template-classic.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplateBaseComponent } from '../base/cv-template-base.component';

@Component({
  selector: 'app-cv-template-classic',
  templateUrl: './cv-template-classic.component.html',
  styleUrls: ['./cv-template-classic.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CvTemplateClassicComponent extends CvTemplateBaseComponent {
  
}