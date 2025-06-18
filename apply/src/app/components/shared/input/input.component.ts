import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class InputComponent {
  @Input() type: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number' = 'text';
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
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
      this.valueChanged.emit(this._currentValue);
    }
  }

  @Output() valueChanged = new EventEmitter<string>();

  isFocused: boolean = false;

  constructor() {}

  // This method is called when the ion-input value changes.
  // It updates the internal _currentValue and emits the valueChanged event.
  onValueChange(event: any): void {
    const newValue = event.detail.value;
    if (newValue !== this._currentValue) {
      this._currentValue = newValue;
      this.valueChanged.emit(this._currentValue);
    }
  }

  // ngModel change is handled by the setter for 'value' if external changes occur.
  // If ngModel is used directly on _currentValue, this ensures the output event is still fired.
  handleModelChange(newValue: string): void {
    if (newValue !== this._currentValue) {
      this._currentValue = newValue;
      this.valueChanged.emit(this._currentValue);
    }
  }
}
