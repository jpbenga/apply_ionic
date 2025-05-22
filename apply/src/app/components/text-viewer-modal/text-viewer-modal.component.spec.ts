import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TextViewerModalComponent } from './text-viewer-modal.component';

describe('TextViewerModalComponent', () => {
  let component: TextViewerModalComponent;
  let fixture: ComponentFixture<TextViewerModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TextViewerModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextViewerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
