import { TestBed } from '@angular/core/testing';

import { FileExtractionService } from './file-extraction.service';

describe('FileExtractionService', () => {
  let service: FileExtractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
