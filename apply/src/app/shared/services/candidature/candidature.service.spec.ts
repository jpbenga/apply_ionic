import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { RouterTestingModule } from '@angular/router/testing';
import { CandidatureService } from './candidature.service';

describe('CandidatureService', () => {
  let service: CandidatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        CandidatureService,
        { provide: Firestore, useValue: {} }, // Mock Firestore
        { provide: Auth, useValue: {} },      // Mock Auth
        { provide: Storage, useValue: {} }    // Mock Storage
      ]
    });
    service = TestBed.inject(CandidatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
