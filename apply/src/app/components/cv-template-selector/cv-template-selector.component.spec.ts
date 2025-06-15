import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CvTemplateSelectorComponent } from './cv-template-selector.component';

describe('CvTemplateSelectorComponent', () => {
  let component: CvTemplateSelectorComponent;
  let fixture: ComponentFixture<CvTemplateSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CvTemplateSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CvTemplateSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
