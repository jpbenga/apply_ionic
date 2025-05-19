import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostulerPage } from './postuler.page';

describe('PostulerPage', () => {
  let component: PostulerPage;
  let fixture: ComponentFixture<PostulerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PostulerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
