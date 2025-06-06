// src/app/models/cv-template.model.ts
import { Experience } from './experience.model';
import { Formation } from './formation.model';
import { Competence } from './competence.model';

export interface CvTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'modern' | 'classic' | 'creative' | 'minimalist';
  component: any;
}

export interface CvTheme {
  primaryColor: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

export interface CvData {
  userId: string;
  experiences: Experience[];
  formations: Formation[];
  competences: Competence[];
  templateId: string;
  theme: CvTheme;
}

export interface GeneratedCv {
  id: string;
  userId: string;
  templateId: string;
  theme: CvTheme;
  data: CvData;
  createdAt: string;
}