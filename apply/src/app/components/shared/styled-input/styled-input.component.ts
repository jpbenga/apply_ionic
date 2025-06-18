/**
 * StyledInputComponent is a reusable UI component for displaying Ionic input fields
 * with consistent styling, label handling, icons, and error messages.
 * It supports integration with both template-driven and reactive forms.
 *
 * @example
 * <app-styled-input label="Email" type="email" placeholder="Enter your email"></app-styled-input>
 * <app-styled-input label="Password" type="password" [control]="passwordFormControl" errorText="Password is required."></app-styled-input>
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { IonItem, IonLabel, IonInput, IonIcon, IonText } from '@ionic/angular/standalone';

let uniqueInputIdCounter = 0;

export type InputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';

@Component({
  selector: 'app-styled-input',
  templateUrl: './styled-input.component.html',
  styleUrls: ['./styled-input.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonText
  ]
})
export class StyledInputComponent implements OnInit {

  /**
   * The text label for the input field.
   */
  @Input() label: string | undefined;

  /**
   * The type of the input field.
   * Defaults to 'text'.
   */
  @Input() type: InputType = 'text';

  /**
   * The placeholder text for the input field.
   * Defaults to an empty string.
   */
  @Input() placeholder: string = '';

  /**
   * The current value of the input field.
   * Defaults to an empty string.
   */
  @Input() value: string | number = '';

  /**
   * Whether the input field is disabled.
   * Defaults to false.
   */
  @Input() disabled: boolean = false;

  /**
   * Whether the input field is read-only.
   * Defaults to false.
   */
  @Input() readonly: boolean = false;

  /**
   * Whether the input field is required.
   * Defaults to false.
   */
  @Input() required: boolean = false;

  /**
   * The FormControl instance for reactive form integration.
   */
  @Input() control: FormControl | undefined;

  /**
   * The name attribute for the input element, useful for native forms.
   */
  @Input() name: string = '';

  /**
   * The unique ID for the input element. If not provided, a unique ID will be generated.
   * Used to link the label to the input.
   */
  @Input() inputId: string = `styled-input-${uniqueInputIdCounter++}`;

  /**
   * The name of the Ionic icon to display at the start (leading) of the input.
   */
  @Input() leadingIcon: string | undefined;

  /**
   * The name of the Ionic icon to display at the end (trailing) of the input.
   */
  @Input() trailingIcon: string | undefined;

  /**
   * An error message to display below the input field.
   */
  @Input() errorText: string | undefined;

  /**
   * Emits the new value of the input field whenever it changes.
   * The event payload is the string or number value from the input.
   */
  @Output() valueChanged = new EventEmitter<string | number>();

  constructor() { }

  ngOnInit(): void {
    if (!this.name && this.label) {
      this.name = this.label.toLowerCase().replace(/\s+/g, '-');
    }
    if (this.control && !this.value && this.control.value) {
        this.value = this.control.value;
    }
  }

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    // For template-driven, ensure this.value is updated if not using ngModel directly for it.
    // If using ngModel, this might be redundant or could be simplified if ngModelChange is used.
    // However, the current HTML for the template-driven part uses [value] and (ionInput).
    this.value = target.value;
    this.valueChanged.emit(this.value);
  }

  /**
   * Generates an error message string from the control's errors.
   * This is used when no explicit errorText input is provided but the control is invalid.
   */
  getCustomErrorText(): string {
    if (!this.control || !this.control.errors || !this.control.touched) {
      return '';
    }

    if (this.control.hasError('required')) {
      return 'Ce champ est requis.';
    }
    if (this.control.hasError('email')) {
      return 'Format email invalide.';
    }
    if (this.control.hasError('minlength')) {
      const requiredLength = this.control.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} caractères.`;
    }
    if (this.control.hasError('maxlength')) {
      const requiredLength = this.control.errors['maxlength'].requiredLength;
      return `Maximum ${requiredLength} caractères.`;
    }
    // Add more custom error checks as needed
    // e.g. pattern, custom validators

    return 'Valeur invalide.'; // Default for other errors
  }
}
