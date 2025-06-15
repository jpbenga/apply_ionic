import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';
import { CvTemplateService } from 'src/app/services/cv-template/cv-template.service';
import { CvDataService } from 'src/app/services/cv-data/cv-data.service';
import { ProfileService } from 'src/app/features/profile/services/profile.service';
import { PdfGeneratorService } from 'src/app/services/pdf-generator/pdf-generator.service';
import { CvSelectorComponent } from './cv-selector.component';

describe('CvSelectorComponent', () => {
  let component: CvSelectorComponent;
  let fixture: ComponentFixture<CvSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CvSelectorComponent],
      providers: [
        { provide: CvGenerationService, useValue: { getGeneratedCvs: () => of([]) } }, // Mock CvGenerationService
        { provide: CvTemplateService, useValue: {} }, // Mock CvTemplateService
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: CvDataService, useValue: {} },
        { provide: ProfileService, useValue: {} },
        { provide: PdfGeneratorService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CvSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
