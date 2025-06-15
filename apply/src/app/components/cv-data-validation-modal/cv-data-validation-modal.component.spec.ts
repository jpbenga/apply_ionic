import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { CvDataValidationModalComponent } from './cv-data-validation-modal.component';

describe('CvDataValidationModalComponent', () => {
  let component: CvDataValidationModalComponent;
  let fixture: ComponentFixture<CvDataValidationModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CvDataValidationModalComponent],
      providers: [
        { provide: ModalController, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CvDataValidationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
