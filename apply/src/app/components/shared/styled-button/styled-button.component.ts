/**
 * StyledButtonComponent is a reusable UI component for displaying Ionic buttons
 * with consistent styling and behavior across the application.
 *
 * @example
 * <app-styled-button color="primary" (click)="doSomething()">Click Me</app-styled-button>
 * <app-styled-button color="secondary" fill="outline" iconName="star">With Icon</app-styled-button>
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

// Define specific literal types for button properties for better type safety.
export type ButtonColor = 'primary' | 'secondary' | 'accent' | 'light' | 'dark' | 'medium' | 'tertiary' | 'success' | 'warning' | 'danger';
export type ButtonFill = 'solid' | 'outline' | 'clear';
export type ButtonSize = 'small' | 'default' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';
export type IconSlot = 'start' | 'end' | 'icon-only';

@Component({
  selector: 'app-styled-button',
  templateUrl: './styled-button.component.html',
  styleUrls: ['./styled-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon] // Import necessary modules for standalone components
})
export class StyledButtonComponent {

  /**
   * The color theme of the button. Uses Ionic color palette.
   * Defaults to 'primary'.
   */
  @Input() color: ButtonColor = 'primary';

  /**
   * The fill style of the button.
   * Defaults to 'solid'.
   */
  @Input() fill: ButtonFill = 'solid';

  /**
   * The size of the button.
   * Defaults to 'default'.
   */
  @Input() size: ButtonSize = 'default';

  /**
   * If 'block', the button will take up the full width of its container.
   * Defaults to undefined (not block).
   */
  @Input() expand: 'block' | undefined = undefined;

  /**
   * If true, the button will be disabled.
   * Defaults to false.
   */
  @Input() disabled: boolean = false;

  /**
   * The type attribute for the button element.
   * Defaults to 'button'.
   */
  @Input() type: ButtonType = 'button';

  /**
   * The name of the Ionic icon to display within the button.
   * If undefined, no icon is displayed.
   */
  @Input() iconName: string | undefined = undefined;

  /**
   * The slot for the icon, if an iconName is provided.
   * Determines icon position relative to the button text.
   * Defaults to 'start'.
   */
  @Input() iconSlot: IconSlot = 'start';

  constructor() { }

}
