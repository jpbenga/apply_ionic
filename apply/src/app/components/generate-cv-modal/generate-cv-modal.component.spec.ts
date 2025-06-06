import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenerateCvModalComponent } from './generate-cv-modal.component';

describe('GenerateCvModalComponent', () => {
  let component: GenerateCvModalComponent;
  let fixture: ComponentFixture<GenerateCvModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GenerateCvModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateCvModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
