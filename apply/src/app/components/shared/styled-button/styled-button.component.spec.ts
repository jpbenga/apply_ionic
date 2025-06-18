import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StyledButtonComponent } from './styled-button.component';

describe('StyledButtonComponent', () => {
  let component: StyledButtonComponent;
  let fixture: ComponentFixture<StyledButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StyledButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StyledButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
