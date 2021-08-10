import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { ProjectApiModel } from 'src/app/workbench/models/api-models/project-api-model';

@Component({
  selector: 'app-project-resources',
  templateUrl: './project-resources.component.html',
  styleUrls: ['./project-resources.component.scss']
})
export class ProjectResourcesComponent implements OnInit {
  public isCollapsed = false;
  public tabSelectorFormGroup: FormGroup;
  public currentProject: ProjectApiModel = null;
  public loading = false;
  public projectErrors: string [];
  public pleaseSelectMessage: string="Please select a project";

  constructor(private formBuilder: FormBuilder, private workbenchService: WorkbenchService) { 
    this.workbenchService.Processing$.subscribe((processing) => {
      this.loading = processing;
    });

    this.workbenchService.ProjectType$.subscribe((newProjectType) => {
         if(newProjectType.toLowerCase()==="project")
         {
           this.pleaseSelectMessage="Please select a project.";
         }
         if(newProjectType.toLowerCase()==="obe")
         {
           this.pleaseSelectMessage="Please select an OBE.";
         }
    });
  }

  ngOnInit(): void {
    this.tabSelectorFormGroup = this.formBuilder.group({
      showDisciplines: false,
         showResources: false,
      showSchedule: false
    });
    this.workbenchService.SelectedProject$.subscribe((p) => {
      this.currentProject = p;
      this.projectErrors = this.workbenchService.projectHasErrors;
    });
  }
  save(): void {
    this.workbenchService.saveCurrentProject();
  }
  public showProjectErrors(): boolean {
    console.log(this.projectErrors);
    return (this.projectErrors && this.projectErrors.length > 0);
  } 
  
  
}
