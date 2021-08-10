import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectResourcesComponent } from './project-resources.component';

describe('ProjectResourcesComponent', () => {
  let component: ProjectResourcesComponent;
  let fixture: ComponentFixture<ProjectResourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectResourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
