import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  standalone: true,
  imports: [CommonModule] // For ngClass
})
export class LogoComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  constructor() { }
}
