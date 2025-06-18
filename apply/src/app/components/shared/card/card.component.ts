import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule] // Included for consistency, useful if template evolves
})
export class CardComponent {
  constructor() { }
}
