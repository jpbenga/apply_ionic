import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CvBuilderPageComponent } from './cv-builder-page.component';

describe('CvBuilderPageComponent', () => {
  let component: CvBuilderPageComponent;
  let fixture: ComponentFixture<CvBuilderPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CvBuilderPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvBuilderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
