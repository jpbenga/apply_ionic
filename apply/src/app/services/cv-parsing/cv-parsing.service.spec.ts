import { TestBed } from '@angular/core/testing';

import { CvParsingService } from './cv-parsing.service';

describe('CvParsingService', () => {
  let service: CvParsingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CvParsingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
