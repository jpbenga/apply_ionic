import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CvDataService } from './cv-data.service';

describe('CvDataService', () => {
  let service: CvDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CvDataService,
        { provide: Firestore, useValue: {} }, // Mock Firestore
        { provide: Auth, useValue: {} }      // Mock Auth
      ]
    });
    service = TestBed.inject(CvDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
