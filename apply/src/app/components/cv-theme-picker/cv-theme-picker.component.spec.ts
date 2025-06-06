import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CvThemePickerComponent } from './cv-theme-picker.component';

describe('CvThemePickerComponent', () => {
  let component: CvThemePickerComponent;
  let fixture: ComponentFixture<CvThemePickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CvThemePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvThemePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
