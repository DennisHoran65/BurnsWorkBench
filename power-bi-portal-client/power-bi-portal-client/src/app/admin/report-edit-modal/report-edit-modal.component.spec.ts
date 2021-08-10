import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEditModalComponent } from './report-edit-modal.component';

describe('ReportEditModalComponent', () => {
  let component: ReportEditModalComponent;
  let fixture: ComponentFixture<ReportEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
