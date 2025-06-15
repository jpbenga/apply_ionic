import { TestBed } from '@angular/core/testing';
import { Storage } from '@angular/fire/storage';
import { StorageService } from '../storage/storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useValue: {} } // Mock Storage
      ]
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
