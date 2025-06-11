import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CandidatureCardComponent } from './candidature-card.component';

describe('CandidatureCardComponent', () => {
  let component: CandidatureCardComponent;
  let fixture: ComponentFixture<CandidatureCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CandidatureCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
