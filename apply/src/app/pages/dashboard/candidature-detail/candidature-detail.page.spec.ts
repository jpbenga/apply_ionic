import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidatureDetailPage } from './candidature-detail.page';

describe('CandidatureDetailPage', () => {
  let component: CandidatureDetailPage;
  let fixture: ComponentFixture<CandidatureDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatureDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
