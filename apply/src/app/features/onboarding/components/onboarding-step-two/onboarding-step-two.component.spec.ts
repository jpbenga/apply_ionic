import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnboardingStepTwoComponent } from './onboarding-step-two.component';

describe('OnboardingStepTwoComponent', () => {
  let component: OnboardingStepTwoComponent;
  let fixture: ComponentFixture<OnboardingStepTwoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OnboardingStepTwoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingStepTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
