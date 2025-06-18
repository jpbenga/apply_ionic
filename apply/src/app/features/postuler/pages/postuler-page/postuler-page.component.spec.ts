import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostulerPageComponent } from './postuler-page.component';

describe('PostulerPageComponent', () => {
  let component: PostulerPageComponent;
  let fixture: ComponentFixture<PostulerPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PostulerPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostulerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
