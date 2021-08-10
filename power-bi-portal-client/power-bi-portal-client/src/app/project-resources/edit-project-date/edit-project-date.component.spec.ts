import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectDateComponent } from './edit-project-date.component';

describe('EditProjectDateComponent', () => {
  let component: EditProjectDateComponent;
  let fixture: ComponentFixture<EditProjectDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProjectDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProjectDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
