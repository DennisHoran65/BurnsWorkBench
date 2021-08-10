import { Component, OnInit } from '@angular/core';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UIProjectEmployeeModel } from 'src/app/workbench/models/ui-models/ui-project-employee';
import { ComposeProjectSchedule } from 'src/app/workbench/composeProjectSchedule';
import { UICustomWeekModel } from 'src/app/workbench/models/ui-models/ui-custom-week';
import { DateFunctions } from 'src/app/workbench/dateFunctions';
import { EmployeeOtherHours } from 'src/app/workbench/models/api-models/employee-other-hours';
import { AreYouSureComponent } from '../are-you-sure/are-you-sure.component';
import { NgbModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { AddScheduleWeeksComponent } from "../add-schedule-weeks-modal/add-schedule-weeks-modal.component";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  public loading = false;
  public numberOfWeeks = 0;
  public weeks: number[] = [];
  public weekEnding: Date[] = [];
  public weekHours: number[] = [];
  public weekDolAmt: number[] = [];
  public weekUtilization: number[] = [];
  public weekProjectHours: number[] = [];
  public weekProjectSpentAmt: number[] = [];
  public weekProjectTotalHours: number[] = [];
  public weekProjectTotalSpentAmt: number[] = [];

  public displayRate = false;
  public editWeekText = 40;
  public divWidth: number=755;


  public selectedResource: UIProjectEmployeeModel = null;
  public selectedEditCustomWeek: Date = null;
  public allResources: UIProjectEmployeeModel[] = [];

  private compose: ComposeProjectSchedule;
  private employeeOtherSchedules: EmployeeOtherHours[] = [];
  private numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  form: FormGroup;

  constructor(private workbenchService: WorkbenchService,
              public fb: FormBuilder,
              public datePipe: DatePipe,
              private modalService: NgbModal) {

    this.form = fb.group({
      customHoursForWeek: '0',
      addHoursPerWeek: '',
      addNumberOfWeeks: ''
    });

    workbenchService.SelectedEmployee$.subscribe((resource) => {
      this.selectedResource = resource;
      this.refreshData();
    });

    workbenchService.ProjectEmployee$.subscribe((resources) => {
      this.allResources = resources;
      this.refreshData();
    });
    workbenchService.DisplayRate$.subscribe((showRate) => {
      this.displayRate = showRate;
    });
    workbenchService.EmployeeOtherSchedule$.subscribe((otherSchedules) => {
      this.employeeOtherSchedules = otherSchedules;
    });
  }

  getCustomWeekForCurrentEmployee(week: Date): UICustomWeekModel {
    const found = this.selectedResource.EmployeeSchedule.filter(es =>
      new Date(es.weekEndDate).toLocaleDateString() === week.toLocaleDateString()
    );
    return found && found.length ? found[0] : null;
  }

  getEmployeeHoursForWeekEnding(week: Date): number {
    const found = this.getCustomWeekForCurrentEmployee(week);
    return found ? found.hours : 0;
  }

  getEmployeeHoursForAllWeeks(): number {
     var hourTotal=0;
       this.selectedResource.EmployeeSchedule.forEach((schedule: UICustomWeekModel)=>{
          hourTotal+=schedule.hours;
        });
      return hourTotal;
      
  }

  getEmployeeUtilForWeekEnding(week: Date): number {
    const hours = this.getEmployeeHoursForWeekEnding(week);

    return hours ? hours / 40 : 0;
  }

  getEmployeeUtilForAllWeeks(){
    const hours=this.getEmployeeHoursForAllWeeks();
    const weekCount=this.weeks.length;

    return hours ? hours / (40 * weekCount) : 0;
  }


  getEmployeeAmtForWeekEnding(week: Date): number {
    const hours = this.getEmployeeHoursForWeekEnding(week);

    return hours ? hours * this.selectedResource.LoadedRate : 0;
  }

  getEmployeeAmtForAllWeeks(): number {
    var amt=0;
    this.weekEnding.forEach((weekEnd)=>{
       amt+=this.getEmployeeAmtForWeekEnding(weekEnd);
    });
    return amt;
  }

  getTotalHoursForWeek(week: Date): number {
    const found = this.getCustomWeekForCurrentEmployee(week);
    return found ? found.hours : 0;
  }


  selectEditCustomWeek(week: Date): void {

    this.selectedEditCustomWeek = week;

    const found = this.getCustomWeekForCurrentEmployee(week);

    if (found) {
      this.form.controls.customHoursForWeek.setValue(found.hours);
    } else {
      this.form.controls.customHoursForWeek.setValue(40);
    }
  }

  getEmployeeHoursOtherProjects(week: Date): number {

    let totalHours = 0;
    const otherWeeksOtherProjects = this.employeeOtherSchedules
      .filter(eos => {
        return new Date(eos.weekEnding).toLocaleDateString() === week.toLocaleDateString()
          && eos.employeeId === this.selectedResource.EmployeeId;
      });

    otherWeeksOtherProjects.forEach((otherProjectWeek) => {
      totalHours += otherProjectWeek.hours;
    });

    // add in any hours where the same resource is on multiple disciplines
    const otherAssignments = this.allResources.filter(res => res.EmployeeId === this.selectedResource.EmployeeId
      && res.ProjectEmployeeId !== this.selectedResource.ProjectEmployeeId);

    if (otherAssignments && otherAssignments.length) {
      otherAssignments.forEach((otherAssignment) => {
        otherAssignment.EmployeeSchedule.forEach((es)=>{
        })
        const otherWeekValues = otherAssignment.EmployeeSchedule
          .filter(es => es.weekEndDate.toLocaleDateString() === week.toLocaleDateString());

        if (otherWeekValues && otherWeekValues.length) {
          otherWeekValues.forEach((weekValue) => {
            totalHours += weekValue.hours;
          });
        }
      });
    }

    return totalHours + this.getEmployeeHoursForWeekEnding(week);
  }

  getEmployeeHoursOtherProjectsAllWeeks(): number {
     var hours=0;
     this.weekEnding.forEach((weekEnd)=>{
       hours+=this.getEmployeeHoursOtherProjects(weekEnd);
     });
     
     return hours;
  }

  getEmployeeUtilOtherProjects(week: Date): number {
    const hours = this.getEmployeeHoursOtherProjects(week);
    return hours ? hours / 40 : 0;
  }

  getEmployeeUtilOtherProjectsTotal(): number {
    const hours=this.getEmployeeHoursOtherProjectsAllWeeks();
    const weekCount=this.weekEnding.length;
    return hours ? hours / (40 * weekCount ) : 0;
  }

  getEmployeeAmtOtherProjects(week: Date): number {
    const hours = this.getEmployeeHoursOtherProjects(week);
    return hours ? hours * this.selectedResource.LoadedRate : 0;
  }

  
  validateHours($event): boolean {
    const hours = this.form.controls.customHoursForWeek.value;
    if (this.numbers.includes($event.key)) {
      return  hours >= 0;
    } else {
      return true;
    }
  }


  validateAddWeeks($event): boolean {
    const weeks = this.form.controls.addNumberOfWeeks.value;
    if (this.numbers.includes($event.key)) {
      return weeks <= 10 && weeks >= 0;
    } else {
      return true;
    }
  }

  isAddValid(): boolean {
    const hours = this.form.controls.addHoursPerWeek.value;
    const weeks = this.form.controls.addNumberOfWeeks.value;
    return(weeks>0 && hours>0);

  }

  showAddWeeks(): any {
    const modalRef = this.modalService.open(AddScheduleWeeksComponent, { centered: true });
    var lastWeek=this.weekEnding[this.weekEnding.length-1];
    lastWeek=DateFunctions.addDays(lastWeek,7);
    modalRef.componentInstance.defaultDate=lastWeek;
    modalRef.componentInstance.resourceName=this.selectedResource.Name;
    setTimeout(()=>{
       modalRef.result.then((result) =>{
         if (result.confirmAdd)
         {
           const firstWeekEndDate: Date= DateFunctions.ngbDateToDate(result.firstWeekEndDate);
           const newStartDate=DateFunctions.addDays(firstWeekEndDate,-6);
           this.addWeeks(newStartDate, result.hoursPerWeek, result.numberOfWeeks);
         }
       });
      }, 200);   
  }

  addWeeks(newStartDate: Date, hoursPerweek: number, numWeeks: number): void {
     /* if (!this.isAddValid())
      {
        return;
      }
      */
         

        const lastStartDate: Date=DateFunctions.addDays(this.weekEnding [this.weekEnding.length-1],-6 );
        const lastWeekNumber=this.weeks[this.weeks.length-1];
        const firstNewWeekNumber=lastWeekNumber + DateFunctions.getNumberOfWeeksApart(lastStartDate,newStartDate);
        const firstWeekEndDate: Date= DateFunctions.addDays(newStartDate,6);

      for(var weekAdd=0;weekAdd<numWeeks;weekAdd++)
      {
        const currWeekEndDate=DateFunctions.addDays(firstWeekEndDate,7*weekAdd);
        const currWeekNumber=firstNewWeekNumber + weekAdd;

        const newWeek:UICustomWeekModel = {projectEmployeeScheduleId: 0,
                                          ProjectEmployeeId: this.selectedResource.ProjectEmployeeId,
                                          weekEndDate: currWeekEndDate,
                                          WeekStartDate: DateFunctions.addDays(currWeekEndDate,-6),
                                          weekNumber: currWeekNumber,
                                          isCustom: true,
                                          hours: hoursPerweek
                                        };

       this.selectedResource.EmployeeSchedule.push(newWeek);
      }

      this.selectedResource.NumberOfWeeks=this.selectedResource.EmployeeSchedule.length;
      this.workbenchService.updateProjectResource(this.selectedResource, true);
      this.selectedEditCustomWeek=null;
      this.refreshData();
      setTimeout(()=>{
        const scrollWidth =document.getElementById("scheduleTableBody").scrollWidth;
        document.getElementById("scheduleTable").scrollLeft=scrollWidth;
      },200);
  }

   
  public utilityErrorWarning(utilityPct: number, otherClass: string): string {
    //if (utilityPct<1.0)
    //{
      utilityPct=utilityPct*100.0;
    //}
    const yellowThreshold:number=100;
    const redThreshold:number=125

    let returnClass= utilityPct <= yellowThreshold
      ? ''
      : utilityPct >= redThreshold ? 'table-error' : 'table-warning';

      if(otherClass)
      {
        returnClass+=' ' + otherClass;
      }

      return returnClass;
      
  }



  public clearWeeksStartingWith(week: Date): void {

    const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
    const weekTimeVal=week.getTime();
    let changed: boolean=false;
    
    modalRef.componentInstance.displayText = 'you want to clear all weeks on or after ' + week.toLocaleDateString();

    modalRef.result.then((result) => {
        if (result.toString() === 'yes') {
            for (var idx=this.selectedResource.EmployeeSchedule.length-1;idx>=0;idx--)
              {
                const currWeekEndDate: Date=new Date(this.selectedResource.EmployeeSchedule[idx].weekEndDate);
                const resourceTimeVal=currWeekEndDate.getTime();
                if (resourceTimeVal>=weekTimeVal)
                {
                  this.selectedResource.EmployeeSchedule.splice(idx,1);
                  
                  changed=true;
                }
             } 
             this.selectedResource.NumberOfWeeks=this.selectedResource.EmployeeSchedule.length;
             this.workbenchService.updateProjectResource(this.selectedResource, changed);
             this.selectedEditCustomWeek=null;
             this.refreshData();
        }
       
      });

    
  }


  saveCustomWeek(week: Date): void {

    const found = this.getCustomWeekForCurrentEmployee(week);
    const hours: number = +this.form.controls.customHoursForWeek.value;
    const changed = found ? found.hours !== hours : true;

    if (found) {
      found.hours = hours;
      found.isCustom = true;
    } else {
      this.selectedResource.EmployeeSchedule.push(
        new UICustomWeekModel(-1,
          this.selectedResource.ProjectEmployeeId,
          null,
          hours,
          week,
          DateFunctions.getMondayOfWeek(week.toDateString()),
          true)
      );
    }

    this.selectedEditCustomWeek = null;
    this.workbenchService.updateProjectResource(this.selectedResource, changed);
    this.refreshData();
  }

  getCustomWeekForSpecificEmployee(week: Date, employee: UIProjectEmployeeModel): UICustomWeekModel {
    const found = employee.EmployeeSchedule.filter(es =>
      new Date(es.weekEndDate).toLocaleDateString() === week.toLocaleDateString()
    );
    return found && found.length ? found[0] : null;
  }

  getProjectTotalHoursForWeek(week: Date): number {
    let totalHours = 0;
    this.allResources.forEach((employee) => {
      const employeeWeek = this.getCustomWeekForSpecificEmployee(week, employee);
      totalHours += employeeWeek ? employeeWeek.hours : 0;
    });

    return totalHours;
  }

  getProjectTotalHoursAllWeeks(): number {
    let totalhours=0;
    this.allResources.forEach((employee) => {
      employee.EmployeeSchedule.map((es)=>{totalhours+=es.hours});
    });
    return totalhours;
  }

  getProjectTotalCostForWeek(week: Date): number {
    let totalCost = 0;
    this.allResources.forEach((employee) => {
      const employeeWeek = this.getCustomWeekForSpecificEmployee(week, employee);
      totalCost += employeeWeek ? employeeWeek.hours * employee.LoadedRate : 0;
    });

    return totalCost;
  }

  getProjectTotalCostAllWeeks(): number {
    let totalCost=0;
    this.allResources.forEach((employee) => {
      employee.EmployeeSchedule.map((es)=>{totalCost+=(es.hours*employee.LoadedRate)});
    });
    return totalCost;
  }

  private refreshData(): void {

    this.loading = true;
    // TODO go through this and clean it up
    this.weeks = [];
    this.weekEnding = [];

    this.weekHours = [];
    this.weekDolAmt = [];
    this.weekUtilization = [];
    this.weekProjectHours = [];
    this.weekProjectSpentAmt = [];
    this.weekProjectTotalHours = [];
    this.weekProjectTotalSpentAmt = [];

    if (!this.allResources.length) {
      this.loading = false;
      return;
    }

    if (!this.selectedResource) {
      this.loading = false;
      return;
    }

    //this.workbenchService.calculateMaxEndDate();
    this.workbenchService.calculateMaxEndDateForResource(this.selectedResource);

    this.compose = new ComposeProjectSchedule(
      this.workbenchService.uiProject,
      this.workbenchService.ProjectEmployee$.value,
      this.workbenchService.projectMaxEndDate
    );

    const employeeSchedule = this.compose.employeeSchedules.find((es) => es.ProjectEmployeeId === this.selectedResource.ProjectEmployeeId);

    if (!employeeSchedule) {
      this.loading = false;
      return;
    }

    let runningTotalHours = 0;
    let runningTotalAmt = 0;

    this.divWidth=85 * (this.compose.projectSchedule.length + 1) + 200;

    this.compose.projectSchedule.forEach((week) => {

      const weekFromSchedule = this.workbenchService.projectWeeklySchedule
        .filter(wk => wk.WeekEndDate.getTime() === week.WeekEndDate.getTime());

      if (weekFromSchedule && weekFromSchedule.length === 1) {
        this.weeks.push(weekFromSchedule[0].WeekNumber);
      } else {
        this.weeks.push(null);
        console.log({ wfs: weekFromSchedule, wed: week.WeekEndDate, sc: this.workbenchService.projectWeeklySchedule });
      }


      this.weekEnding.push(week.WeekEndDate);

      const employeeWeekSchedule = this.selectedResource.EmployeeSchedule.filter((es) =>
        new Date(es.WeekStartDate).toLocaleDateString() === week.WeekEndDate.toLocaleDateString()
      );

      if (employeeWeekSchedule && employeeWeekSchedule.length === 1) {
        this.weekHours.push(employeeWeekSchedule[0].hours);
        this.weekDolAmt.push(employeeWeekSchedule[0].hours * this.selectedResource.LoadedRate);
        this.weekUtilization.push(employeeWeekSchedule[0].hours / 100);
        // this.weekProjectHours.push(employeeWeekSchedule[0].TotalProjectBudgetHours);
        // this.weekProjectSpentAmt.push(employeeWeekSchedule[0].TotalProjectBudgetedAmount);
        this.weekProjectHours.push(0);
        this.weekProjectSpentAmt.push(0);
      } else {
        this.weekHours.push(0);
        this.weekDolAmt.push(0);
        this.weekUtilization.push(0);
        // todo - get the previous one
        this.weekProjectHours.push(0);
        this.weekProjectSpentAmt.push(0);
      }

      runningTotalHours += this.compose.totalHours[week.WeekNumber];
      runningTotalAmt += this.compose.totalAmt[week.WeekNumber];

      this.weekProjectTotalHours.push(runningTotalHours);
      this.weekProjectTotalSpentAmt.push(runningTotalAmt);
    });
    this.loading = false;
  }

  public columnLeft(idx: number) : number {
    const beginLeft=300;
    return beginLeft + 85*idx;
  }

  ngOnInit(): void {
  }
}

export class CalendarMaxWeek {
  constructor(
    public ResourceId: number,
    public StartDate: Date,
    public EndDate: Date
  ) {

  }
}
