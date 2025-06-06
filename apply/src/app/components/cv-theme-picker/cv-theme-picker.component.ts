// src/app/components/cv-theme-picker/cv-theme-picker.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cv-theme-picker',
  templateUrl: './cv-theme-picker.component.html',
  styleUrls: ['./cv-theme-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CvThemePickerComponent {
  @Output() themeSelected = new EventEmitter<string>();

  themes: { name: string, color: string }[] = [
    { name: 'Blue', color: '#007bff' },
    { name: 'Purple', color: '#6f42c1' },
    { name: 'Green', color: '#28a745' },
    { name: 'Orange', color: '#fd7e14' },
    { name: 'Red', color: '#dc3545' },
    { name: 'Teal', color: '#20c997' },
    { name: 'Dark', color: '#343a40' }
  ];

  selectedThemeColor: string = '#007bff';

  selectTheme(color: string) {
    this.selectedThemeColor = color;
    this.themeSelected.emit(color);
    console.log('Couleur sélectionnée:', color);
  }
}