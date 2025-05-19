import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LetterTemplateComponent } from './letter-template.component';

describe('LetterTemplateComponent', () => {
  let component: LetterTemplateComponent;
  let fixture: ComponentFixture<LetterTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LetterTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LetterTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
