import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CvUploadComponent } from './cv-upload.component';

describe('CvUploadComponent', () => {
  let component: CvUploadComponent;
  let fixture: ComponentFixture<CvUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CvUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
