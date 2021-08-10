import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReportCategoryComponent } from './admin-report-category.component';

describe('AdminReportCategoryComponent', () => {
  let component: AdminReportCategoryComponent;
  let fixture: ComponentFixture<AdminReportCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminReportCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminReportCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
