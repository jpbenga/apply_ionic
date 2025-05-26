import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCvPage } from './my-cv.page';

describe('MyCvPage', () => {
  let component: MyCvPage;
  let fixture: ComponentFixture<MyCvPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCvPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
