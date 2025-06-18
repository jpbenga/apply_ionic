import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TextareaComponent {
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() rows: number = 5;
  @Input() autoGrow: boolean = false;
  @Input() helperText?: string;
  @Input() errorText?: string;

  _currentValue: string = '';
  @Input()
  get value(): string {
    return this._currentValue;
  }
  set value(val: string) {
    if (val !== this._currentValue) {
      this._currentValue = val;
      // Emit change if the value is set programmatically
      this.valueChanged.emit(this._currentValue);
    }
  }

  @Output() valueChanged = new EventEmitter<string>();

  isFocused: boolean = false;

  constructor() {}

  // This method is called when the ngModel of ion-textarea changes.
  handleModelChange(newValue: string): void {
    // Check if the value actually changed to prevent infinite loops or unnecessary emissions
    if (newValue !== this._currentValue) {
      this._currentValue = newValue;
      this.valueChanged.emit(this._currentValue);
    }
  }
}
