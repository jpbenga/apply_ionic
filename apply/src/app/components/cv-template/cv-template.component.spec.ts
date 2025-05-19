import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CvTemplateComponent } from './cv-template.component';

describe('CvTemplateComponent', () => {
  let component: CvTemplateComponent;
  let fixture: ComponentFixture<CvTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CvTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
