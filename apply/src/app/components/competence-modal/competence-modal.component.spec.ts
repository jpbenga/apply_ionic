import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { CompetenceModalComponent } from './competence-modal.component';

describe('CompetenceModalComponent', () => {
  let component: CompetenceModalComponent;
  let fixture: ComponentFixture<CompetenceModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CompetenceModalComponent],
      providers: [
        { provide: ModalController, useValue: {} } // Mock ModalController
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetenceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
