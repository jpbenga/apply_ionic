import { TestBed } from '@angular/core/testing';

import { CvDataService } from './cv-data.service';

describe('CvDataService', () => {
  let service: CvDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CvDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
