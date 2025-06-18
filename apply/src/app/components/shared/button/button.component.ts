import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // Using IonicModule for ion-button and ion-icon

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule] // Add CommonModule for ngClass and IonicModule for Ionic components
})
export class ButtonComponent {
  @Input() text: string = 'Button'; // Default text
  @Input() styleType: 'primary' | 'secondary' | 'outline' | 'default' = 'default';
  @Input() iconName?: string;
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;

  @Output() buttonClick = new EventEmitter<void>();

  constructor() { }

  onClick(): void {
    this.buttonClick.emit();
  }
}
