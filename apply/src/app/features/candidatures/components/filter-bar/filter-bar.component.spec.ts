import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FilterBarComponent } from './filter-bar.component';

describe('FilterBarComponent', () => {
  let component: FilterBarComponent;
  let fixture: ComponentFixture<FilterBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FilterBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
