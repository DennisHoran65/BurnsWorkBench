import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KeyValuePair } from 'src/app/workbench/models/key-value-pair';
import { DisciplineInfo } from 'src/app/workbench/models/api-models/discipline-info';
import { UIProjectModel } from 'src/app/workbench/models/ui-models/ui-project';
import { UIDisciplineModel } from 'src/app/workbench/models/ui-models/ui-discipline';
import { UIProjectEmployeeModel } from 'src/app/workbench/models/ui-models/ui-project-employee';
import { ProjectDiscipline } from 'src/app/workbench/models/api-models/project-discipline';
import { ProjectApiModel } from 'src/app/workbench/models/api-models/project-api-model';
import { ProjectInfo } from 'src/app/workbench/models/api-models/project-increment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-disciplines',
  templateUrl: './disciplines.component.html',
  styleUrls: ['./disciplines.component.scss']
})

export class DisciplinesComponent implements OnInit {

  @ViewChild('pct_input') pctField: ElementRef;
  public methods: KeyValuePair[] = [
    new KeyValuePair('percent', 'Percent (%)'),
    new KeyValuePair('dollar', 'Amount ($)')];

  public displayStyle = 'PCT';
  public currentlyShowingRate = false;
  private resourceList: UIProjectEmployeeModel[] = [];

  public project: ProjectApiModel;
  public disciplines: any[] = [];
  public projectDisciplines: any[] = [];
  public x: any;
  public projectType: string;

  public edittingDiscipline: UIDisciplineModel = new UIDisciplineModel(new DisciplineInfo(0, '', 0));
  private disciplineList: DisciplineInfo[] = [];
  public uiProject: UIProjectModel;

  public UnallocatedPct = 0;
  public UnallocatedAmount = 0;
  public TotalPct = 0;
  public TotalAmount = 0;
  public TotalAllocatedResources = 0;
  public TotalAllocatedAmt = 0;
  public TotalAllocatedHours = 0;
  public TotalNotAllocatedAmt = 0;
  private disciplineEditHasError = false;

  public displayAllDisciplines = true;
  private numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  form: FormGroup;
  constructor(
    private workbenchService: WorkbenchService,
    public fb: FormBuilder,
    public toastr: ToastrService,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2) {

    // all messages on this page are validation items
    this.toastr.toastrConfig.timeOut = 4000;

    this.uiProject = this.workbenchService.uiProject;

    workbenchService.DisplayAllDisciplines$.subscribe((showAll) => {
      this.displayAllDisciplines = showAll;
    });

    workbenchService.ProjectType$.subscribe((newProjectType)=>{
      this.projectType=newProjectType;
    });


    workbenchService.DisplayRate$.subscribe((showingRate) => {
      this.currentlyShowingRate = showingRate;
    });
    workbenchService.EditDisciplineStyle$.subscribe((style) => {
      this.displayStyle = style;
    });
    workbenchService.ProjectEmployee$.subscribe((resources) => {
      this.resourceList = resources;
      this.UpdateResourceData();
      this.updateProjectTotals();
    });

    workbenchService.SelectedProject$.subscribe((p) => {
      if (p) {
        this.edittingDiscipline = new UIDisciplineModel(new DisciplineInfo(0, '', 0));
        this.project = p;
        this.loadDisciplines();
      } else {
        // project cleared
        this.edittingDiscipline = new UIDisciplineModel(new DisciplineInfo(0, '', 0));
        this.project = new ProjectApiModel(new ProjectInfo(null, null, null, null, null, null, null, null, null, null, null, null, null,null, 0,null,0,0,true), [], []);
        this.loadDisciplines();
      }
    });

    this.workbenchService.getDisciplines().subscribe((disiplines) => {
      this.disciplineList = disiplines;
      this.loadDisciplines();
    });

    this.form = fb.group({
      billingBudgeted: '',
      method: 'percent',
      discipline_pct_amount: '',
      discipline_dol_amount: ''
    });
  }

  ngOnInit(): void {

  }


  private loadDisciplines() {
    if (this.project && this.disciplineList && this.project.projectDetail) {
      this.uiProject.createDisciplines(this.disciplineList, this.project.projectDisciplines);
      this.UpdateResourceData();
      this.workbenchService.projectDisciplinesChanged(this.uiProject.disciplines);
      this.updateProjectTotals();
    }
  }

  changeMethod($event): void {
    this.uiProject.disciplineViewMethod = this.form.controls.method.value;
  }

  setDisplayAll(displayAll: boolean): void {
        this.workbenchService.DisplayAllDisciplines$.next(displayAll);
  }

  public clearEditingDiscipline(): void {
    if (!this.disciplineEditHasError) {
      this.edittingDiscipline = new UIDisciplineModel(new DisciplineInfo(0, '', 0));
    }
  }

  // should I display the discipline in read mode on the screen
  displayDisciplineReadOnly(discipline: UIDisciplineModel): boolean {
    // if it is not the one being edited
    // if it has information
    // if it doesnt have information but the screen is expanded

    const show = this.edittingDiscipline
      && discipline.disciplineName !== this.edittingDiscipline.disciplineName // not being edited
      && (
        (discipline.pctAmount > 0 || discipline.allocatedHours > 0) // it has info
        || (this.displayAllDisciplines)
      ); // OR no info but show all disciplines

    return show;
  }

  editDiscipline(d): void {
    if (!this.disciplineEditHasError) {
      this.edittingDiscipline = d;
      this.form.controls.discipline_pct_amount.setValue(d.pctAmount.toFixed());
      this.form.controls.discipline_dol_amount.setValue(d.dolAmount.toFixed());
      if (this.displayStyle === 'PCT') {
        this.setFocusOnPct('#pct_input');
      } else {
        this.setFocusOnPct('#dol_input');
      }
    }
  }

  setFocusOnPct(fieldId: string): void {
    this.changeDetectorRef.detectChanges();
    const that = this;
    setTimeout(() => {
      const element = that.renderer.selectRootElement(fieldId);
      element.focus();
    }, 100);
  }

  updateDiscipline(): void {

    if (this.displayStyle === 'PCT') {
      const pct: number = +this.form.controls.discipline_pct_amount.value;
      this.edittingDiscipline.pctAmount = pct;
      this.edittingDiscipline.dolAmount = this.project.projectDetail.billingBudgeted * .01 * pct;

      //if (pct <= 104 && pct >= 0) {
      //  this.disciplineEditHasError = false;
      //} else {
      //  this.disciplineEditHasError = true;
       // this.setFocusOnPct('#pct_input');
      //}
    } else {
      const amt: number = +this.form.controls.discipline_dol_amount.value;
      const pct: number = (amt / this.project.projectDetail.billingBudgeted * 100);
      this.edittingDiscipline.dolAmount = amt;
      this.edittingDiscipline.pctAmount = amt / this.project.projectDetail.billingBudgeted * 100;

      //if (pct <= 104 && pct >= 0) {
      //  this.disciplineEditHasError = false;
     // } else {
      //  this.disciplineEditHasError = true;
        //this.setFocusOnPct('#dol_input');
     // }
    }

    // if total value is above max, do not let them save
    this.updateProjectTotals();
    //if (this.TotalPct > 104) {
    //  this.disciplineEditHasError = true;
    //  const buttonText="<br /><center><font color=\"blue\"><b><u>OK</u></b></font></center>"

      /*
      this.toastr.error('Discipline total can not exceed 104% of project budget' + buttonText, 'Validation error', {closeButton: true, timeOut: 0, extendedTimeOut: 0, enableHtml: true});
      if (this.displayStyle === 'PCT') {
        this.setFocusOnPct('#pct_input');
      } else {
        this.setFocusOnPct('#dol_input');
      }
      */
  //  }
    this.workbenchService.projectDisciplinesChanged(this.uiProject.disciplines, true);
  }

  updateProjectTotals(): void {

    this.UnallocatedPct = 0;
    this.UnallocatedAmount = 0;
    this.TotalPct = 0;
    this.TotalAmount = 0;

    this.TotalAllocatedResources = 0;
    this.TotalAllocatedAmt = 0;
    this.TotalNotAllocatedAmt = 0;
    this.TotalAllocatedHours = 0;

    this.uiProject.disciplines.forEach((projectDiscipline) => {
      this.TotalPct += projectDiscipline.pctAmount;
      this.TotalAmount += projectDiscipline.dolAmount;
      this.TotalAllocatedResources += projectDiscipline.numResources;
      this.TotalAllocatedAmt += projectDiscipline.resourceDolAllocated;
      this.TotalAllocatedHours += projectDiscipline.allocatedHours;
    });

    this.TotalNotAllocatedAmt = this.TotalAmount - this.TotalAllocatedAmt;
    this.UnallocatedPct = 100 - this.TotalPct;
    this.UnallocatedAmount = this.project?.projectDetail?.billingBudgeted - this.TotalAmount;
  }

  private UpdateResourceData(): void {
    this.resetAllDisciplines();
    if (this.resourceList && this.resourceList.length && this.uiProject.disciplines && this.uiProject.disciplines.length) {
      this.resourceList.forEach((resource) => {
        if (resource.Discipline !== '') {
          const disc = this.uiProject.disciplines.find(d => d.disciplineName === resource.Discipline);
          if (disc) {
            disc.numResources++;
            disc.allocatedHours += resource.getTotalHours();
            disc.resourceDolAllocated += resource.getResourceCost();
          }
        }
      });
    }
  }

  private resetAllDisciplines(): void {
    this.uiProject.disciplines.forEach((discipline) => {
      discipline.numResources = 0;
      discipline.resourceDolAllocated = discipline.historicalAllocatedBudget;
      discipline.allocatedHours = discipline.historicalAllocatedHours;
      discipline.numResources = discipline.historicalAllocatedResources;
    });
  }

  public updateDisciplineAllocationStyle(style: string): void {
    if (!this.disciplineEditHasError) {
      this.workbenchService.EditDisciplineStyle$.next(style);
    }
  }

  public overBudgetErrorWarning(): string {
    return this.TotalPct <= 100
      ? ''
      : this.TotalPct > 104 ? 'table-error' : 'table-warning';
  }

  public overAllocationErrorWarning(amt: number, total: number): string {
    if (amt === 0 || total === 0) {
      return '';
    }
    const pct = amt / total;
    return pct <= 1
      ? ''
      : pct >= 1.2 ? 'table-error' : 'table-warning';
  }

}
