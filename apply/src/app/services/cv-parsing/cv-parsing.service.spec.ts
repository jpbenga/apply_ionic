import { TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';
import { CvParsingService } from './cv-parsing.service';

describe('CvParsingService', () => {
  let service: CvParsingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CvParsingService,
        { provide: Functions, useValue: {} } // Mock Functions
      ]
    });
    service = TestBed.inject(CvParsingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
