import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnboardingStepThreeComponent } from './onboarding-step-three.component';

describe('OnboardingStepThreeComponent', () => {
  let component: OnboardingStepThreeComponent;
  let fixture: ComponentFixture<OnboardingStepThreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OnboardingStepThreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingStepThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
