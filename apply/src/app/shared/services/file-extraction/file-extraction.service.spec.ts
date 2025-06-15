import { TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';
import { FileExtractionService } from './file-extraction.service';

describe('FileExtractionService', () => {
  let service: FileExtractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileExtractionService,
        { provide: Functions, useValue: {} } // Mock Functions
      ]
    });
    service = TestBed.inject(FileExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
