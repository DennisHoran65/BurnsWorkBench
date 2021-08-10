import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { ProjectInfo } from './models/api-models/project-increment';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { ProjectManager } from './models/api-models/project-manager';
import { DisciplineInfo } from './models/api-models/discipline-info';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UIProjectEmployeeModel } from './models/ui-models/ui-project-employee';
import { NgbDateStruct, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UIDisciplineModel } from './models/ui-models/ui-discipline';
import { ProjectApiModel } from './models/api-models/project-api-model';
import { UIProjectModel } from './models/ui-models/ui-project';
import { ProjectDiscipline } from './models/api-models/project-discipline';
import { Employee } from './models/api-models/employee';
import { ProjectEmployeeApiModel } from './models/api-models/project-employee';
import { NgbDateStructAdapter } from '@ng-bootstrap/ng-bootstrap/datepicker/adapters/ngb-date-adapter';
import { DateFunctions } from './dateFunctions';
import { EmployeeOtherHours } from './models/api-models/employee-other-hours';
import { ToastrService } from 'ngx-toastr';
import { ValidateProject } from './validate-project';
import { AreYouSureComponent } from '../project-resources/are-you-sure/are-you-sure.component';
import { WeeklySchedule } from './models/ui-models/ui-calendar';
import { MsalService } from '@azure/msal-angular';
import { UICustomWeekModel } from './models/ui-models/ui-custom-week';
import { environment} from 'src/environments/environment';
import { catchError, max } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkbenchService {

  public uiProject: UIProjectModel = new UIProjectModel(null);
  public SelectedEmployee$: BehaviorSubject<UIProjectEmployeeModel> = new BehaviorSubject<UIProjectEmployeeModel>(null);
  public ProjectEmployee$: BehaviorSubject<UIProjectEmployeeModel[]> = new BehaviorSubject<UIProjectEmployeeModel[]>([]);
  public DisplayRate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public DisplayAllDisciplines$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public EditDisciplineStyle$: BehaviorSubject<string> = new BehaviorSubject<string>('PCT');
  public FilteredProjectInfo$: BehaviorSubject<ProjectInfo[]> = new BehaviorSubject<ProjectInfo[]>([]);
  public SelectedProjectManager$: BehaviorSubject<ProjectManager> = new BehaviorSubject<ProjectManager>(null);
  public SelectedProject$: BehaviorSubject<ProjectApiModel> = new BehaviorSubject<ProjectApiModel>(null);
  public TopLevelProject$: BehaviorSubject<ProjectInfo[]> = new BehaviorSubject<ProjectInfo[]>([]);
  public ProjectType$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public EmployeeOtherSchedule$: BehaviorSubject<EmployeeOtherHours[]> = new BehaviorSubject<EmployeeOtherHours[]>([]);
  public AllSchedulesForTesting$: BehaviorSubject<EmployeeOtherHours[]> = new BehaviorSubject<EmployeeOtherHours[]>([]);
  public ProjectHasChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public ReportPageChanged$: BehaviorSubject<string>= new BehaviorSubject<string>(null);
  public ShowAllProjectDisciplines$:BehaviorSubject<boolean>=new BehaviorSubject<boolean>(false);
  public Permissions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public projectWeeklySchedule: WeeklySchedule[] = [];
  public projectHasErrors: string[] = [];
  
  public Processing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private discliplines: DisciplineInfo[] = [];
  private startDate: NgbDateStruct = { year: 2020, month: 5, day: 11 };
  // data used to save updates
  private saveProjectModel: ProjectApiModel;
  public projectDiscipline$: BehaviorSubject<UIDisciplineModel[]> = new BehaviorSubject<UIDisciplineModel[]>([]);
  private nextNewId = 0;
  public projectMaxEndDate: Date;
  public projectType: string="project"; //project or obe

  // todo - move this to an environment variable

  // Use this to test locally
  //private urlRoot = 'https://localhost:44386/api/workbench/';

  private urlRoot= environment.apiUrl + '/api/workbench/';


  // use this to test against client qa
  //private urlRoot = 'https://power-bi-portal-api20200703110839.azurewebsites.net/api/workbench/';

  // use this to test against gl-only dev
  //private urlRoot       = 'https://burns-workbench-glonly.azurewebsites.net/api/workbench/';

  constructor(private http: HttpClient, public toastr: ToastrService, private modalService: NgbModal, private authService: MsalService) {

    toastr.toastrConfig.positionClass = 'toast-center-center';
    this.getDisciplines().subscribe((disc) => {
      this.discliplines = disc;
    });

    

    this.getPermissions();


    this.SelectedProjectManager$.subscribe((projMgr) => {
      let projMgrId=null;
      if (projMgr)
      {
        projMgrId=projMgr.id;
      }
      
      this.updateFilteredProjectList(projMgrId);
      /*this.http.get<ProjectInfo[]>(this.urlRoot + 'projectsearchinfo/' + this.projectType + '/' + projMgrId)
        .pipe((data) => data)
        .toPromise()
        .then((projInfoList) => {
          this.FilteredProjectInfo$.next(projInfoList);
        });
        */
    });
  }

  public checkAuthCode(authCode: string) {

  const authToken = {code: authCode};

  const options  = {options: { headers : [{ 'Content-Type': 'application/json'}]}};
  this.http.post<boolean>(this.urlRoot + 'checkAuthCode', authToken).subscribe((r) => {
    this.authenticated.next(r);
  });
  }

  public getHeaders(): HttpHeaders {
    
    let  headers: HttpHeaders = new HttpHeaders();
    const currAccount= this.authService.getAccount();
    if (currAccount)
    {
    const currGroups= currAccount.idTokenClaims.groups;

    headers = headers.append('userName', currAccount.userName);
    headers = headers.append('groupids', currGroups );
    }
    return headers;

  }

  public updateFilteredProjectList(projMgrId: string)
  {
    this.http.get<ProjectInfo[]>(this.urlRoot + 'projectsearchinfo/' + this.projectType + '/' + projMgrId)
    .pipe((data) => data)
    .toPromise()
    .then((projInfoList) => {
      this.FilteredProjectInfo$.next(projInfoList);
    });
  }

  public setProjectType(newProjectType: string) {
    this.projectType=newProjectType;

    this.getTopLevelProjects().subscribe((topLevelProj) => {
      this.TopLevelProject$.next(topLevelProj);
    });

    this.ProjectType$.next(newProjectType);
  }

  public logMessage(message: string): void {
    console.log(message);
    const log = { Message : message};


    this.http.post<void>(this.urlRoot + 'logMessage', log).subscribe((x) => {
      // do nothing, but keep this or else it will not be executed
    });
  }

  public changeReportPage(newPage: string){
    this.ReportPageChanged$.next(newPage);
  }

   public updateCurrentProjectStartDate(newStartDate: string): void {
      this.saveProjectModel.projectDetail.startDate=newStartDate;
      //this.saveProjectModel.projectDetail.savedInWorkbench=true;
      this.saveCurrentProject();
   }

  public saveCurrentProject(): void {
    const buttonText="<br /><center><font color=\"blue\"><b><u>OK</u></b></font></center>";
    this.Processing$.next(true);
    this.uiProject.disciplines = this.projectDiscipline$.value;
    
    this.saveProjectModel.projectDetail.lastSavedStartDate=this.saveProjectModel.projectDetail.startDate;

    const toastErrorConfig = {closeButton: true, timeOut: 0, extendedTimeOut: 0,enableHtml: true};
    this.saveProjectModel.userName = this.authService.getAccount().userName;

    this.saveProjectModel.projectDisciplines =
      this.projectDiscipline$.value.map(d => new ProjectDiscipline(d.projectDisciplineId, d.projectId,
        +d.disciplineId, d.disciplineName, d.pctAmount, d.dolAmount));

    this.saveProjectModel.projectEmployees = this.ProjectEmployee$.value
      .map(e =>
        new ProjectEmployeeApiModel(e.ProjectEmployeeId, e.EmployeeId, e.Name, e.ProfitCenter,
          +e.DisciplineId,
          e.Discipline, e.AssignedPM, e.LocationGeography, e.LoadedRate,
          this.formatDateForSave(e.StartDate),
          this.formatDateForSave(e.StartWeekEndDate),
          e.HoursPerWeek, e.NumberOfWeeks, e.EmployeeSchedule
      ));

    const validationErrors = ValidateProject.validate(this.saveProjectModel);
    if(validationErrors && validationErrors.length === 0) {

      const options = {headers: this.getHeaders(), method: 'POST'};

      this.http.post<boolean>(this.urlRoot + 'save', this.saveProjectModel, options)
      .subscribe((result) => {
        if (result) {
          this.toastr.success('Project update saved');
          this.LoadProject(this.saveProjectModel.projectDetail.projectId);
          this.Processing$.next(false);
          } else {
            this.toastr.error('There was an error saving your project.' + buttonText, 'Error Saving', toastErrorConfig);
            this.Processing$.next(false);
        }
      }, err => {

        console.log(err);
        this.toastr.error('There was an error saving your project.' + buttonText, 'Error Saving', toastErrorConfig);
        this.Processing$.next(false);
      });
    } else {
      const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
      modalRef.componentInstance.title = 'Errors with project';
      modalRef.componentInstance.errors = validationErrors;
      this.Processing$.next(false);
    }
  }

  public formatDateForSave(dt: NgbDateStruct): string {
    return `${dt.year}-` +
           `${dt.month.toString().length === 1 ? '0' : ''}${dt.month}-` +
           `${dt.day.toString().length === 1 ? '0' : ''}${dt.day}` +
           `T00:00:00`;
    // return `${dt.year}-${dt.month.toString().length === 1 ? '0' : ''}${dt.month}-${dt.day}T00:00:00`;
  }
  public LoadProject(projectId: string): void {
    this.Processing$.next(true);

    // todo handle error here 

    // here is where we will wait for all the init items to complete
    this.http.get<ProjectApiModel>(this.urlRoot + 'project/' + this.projectType + '/' + projectId)
      .pipe((data) => data)
      .toPromise()
      .then((proj) => {
        try {
          this.projectHasErrors = [];
          this.saveProjectModel = proj;
          this.validateProjectLoad(proj);

          if (this.projectHasErrors.length === 0) {


            this.uiProject = new UIProjectModel(proj.projectDetail);

            this.LoadProjectEmployees(this.saveProjectModel);
            this.SelectedProject$.next(proj);
            this.SelectedEmployee$.next(null);

            this.setProjectSchedule();
            this.resetOtherSchedules();
          } else {
            this.SelectedProject$.next(null);
          }
          this.ProjectHasChanges$.next(false);
          this.Processing$.next(false);
          } catch (err) {
            this.projectHasErrors.push('An unexpected error occurred when loading the project');
            console.log(err);
            this.ProjectHasChanges$.next(false);
            this.Processing$.next(false);
          }
      });
  }

  public adjustResourceDatesForProject( resources: UIProjectEmployeeModel[], dayAdjustment: number){
    const msg="Adjusted dates for  " + resources.length.toString() + " resource(s). Save the project to complete the change.";   

   
    resources.forEach((resource)=>{

         const currStartDate=DateFunctions.ngbDateToDate(resource.StartDate);
         var updatedStartDate=DateFunctions.addDays(currStartDate, dayAdjustment);
         updatedStartDate=DateFunctions.getMondayOfWeek(updatedStartDate.toString());
         var updatedStartWeekEndDate=DateFunctions.addDays(updatedStartDate,6);
         resource.StartDate= DateFunctions.dateStringToNgbDate(updatedStartDate.toDateString());
         resource.StartWeekEndDate= DateFunctions.dateStringToNgbDate(updatedStartWeekEndDate.toDateString());
         resource.EmployeeSchedule.forEach((schedule: UICustomWeekModel)=>{
            var startDate=schedule.WeekStartDate;
            if(!startDate)
            {
              startDate=schedule["weekStartDate"];
            }
            schedule.WeekStartDate=DateFunctions.addDays(startDate , dayAdjustment);
            schedule.weekEndDate=DateFunctions.addDays(schedule.WeekStartDate, 6);
         })
         this.updateProjectResource(resource, true);
    });

  }

  private validateProjectLoad(proj: ProjectApiModel): void {
    const toastErrorConfig={closeButton: true, timeOut: 0, extendedTimeOut: 0,enableHtml: true};
    const buttonText="<br /><center><font color=\"blue\"><b><u>OK</u></b></font></center>";

    if (proj.projectDetail.startDate === null) {
      this.projectHasErrors.push('Project has no start date.   Please fill this out before editing.');
      this.toastr.error('Project has no start date.   Please fill this out before editing.' + buttonText, 'No Start Date',toastErrorConfig);
    }
  }

  public ClearProject(): void {

    this.SelectedProject$.next(null);
    this.SelectedEmployee$.next(null);
    this.ProjectHasChanges$.next(false);
  }

  private LoadProjectEmployees(project): void {
    const employees: UIProjectEmployeeModel[] = [];

    project.projectEmployees.forEach((pe) => {

      const dtStartDate = new Date(pe.startDate);
      const dtStartWeekEndDate = new Date(pe.startWeekEndDate);
      const convertedStartDate: NgbDate = new NgbDate(dtStartDate.getFullYear(), dtStartDate.getMonth() + 1, dtStartDate.getDate());
      const convertedStartWeekEndDate: NgbDate=new NgbDate(dtStartWeekEndDate.getFullYear(), dtStartWeekEndDate.getMonth() + 1, dtStartWeekEndDate.getDate());

      // const employeeSchedule: UICustomWeekModel[] = [];

       
      const employeeSchedule: UICustomWeekModel[]=pe.employeeSchedule.map((s)=>{
        const weekEndDate= new Date(s.weekEndDate);
        weekEndDate.setHours(0,0,0,0);
        const weekStartDate=new Date(s.weekStartDate ? s.weekStartDate: s.WeekStartDate);
        weekStartDate.setHours(0,0,0,0);
        return { projectEmployeeScheduleId: s.projectEmployeeScheduleId ,
                 ProjectEmployeeId: s.ProjectEmployeeId ? s.ProjectEmployeeId: s.projectEmployeeId,
                 weekNumber: s.weekNumber,
                 hours: s.hours,
                 weekEndDate: weekEndDate,
                 WeekStartDate: weekStartDate,
                 isCustom: s.isCustom
        };
      });
           
      const uiEmployee = new UIProjectEmployeeModel(
        pe.projectEmployeeId,
        pe.employeeId,
        pe.employeeName,
        pe.profitCenter,
        pe.disciplineId,
        pe.discipline,
        pe.assignedPM,
        pe.locationGeography,
        pe.loadedRate,
        pe.jobCostRate,
        convertedStartDate,
        convertedStartWeekEndDate,
        pe.hoursPerWeek,
        pe.numberOfWeeks,
        pe.isGenericResource,
        employeeSchedule,
      );

    
      uiEmployee.resetProjectSchedule();
      employees.push(uiEmployee);
    });
    this.ProjectEmployee$.next(employees);

  }
  public getEmployees(): Observable<any> {
    return this.http.get<Employee[]>(this.urlRoot + 'employees')
      .pipe((data) => data);
  }

  public getProjectManagers(projectType: string): Observable<ProjectManager[]> {
    return this.http.get<ProjectManager[]>(this.urlRoot + 'projectmanagers/' + projectType)
      .pipe((data) => data);
  }

  public getDisciplines(): Observable<DisciplineInfo[]> {
    return this.http.get<DisciplineInfo[]>(this.urlRoot + 'disciplines')
      .pipe((data) => data);
  }

  public getTopLevelProjects(): Observable<ProjectInfo[]>{
    return this.http.get<ProjectInfo[]>(this.urlRoot + 'toplevelprojectlist/' + this.projectType)
        .pipe((data) => data);
  }

public getPermissions(): void {
  const options = {headers: this.getHeaders(), method: 'POST'};
  this.http.post<string[]>(this.urlRoot + 'permissions',null,options)
       .pipe((data) => data)
       .toPromise()
       .then((permissionList:string[]) => {
             this.Permissions$.next(permissionList);
        });   
}

  public setSelectedResource(resource: UIProjectEmployeeModel): void {
    this.SelectedEmployee$.next(resource);
    this.calculateMaxEndDateForResource(resource);
  }

  public updateProjectResource(updateResource: UIProjectEmployeeModel, resourceChanged = false): void {
    this.ProjectEmployee$.value.forEach((item, i) => {
      if (item.ProjectEmployeeId === updateResource.ProjectEmployeeId) {
        updateResource.resetProjectSchedule();
        if (resourceChanged) {
          this.ProjectEmployee$.value[i] = updateResource;
          this.ProjectEmployee$.next(this.ProjectEmployee$.value);
          this.ProjectHasChanges$.next(true);
          this.calculateMaxEndDateForResource(updateResource);
        }
      }
    });
  }

  




  private areResourcesTheSame(r1: UIProjectEmployeeModel, r2: UIProjectEmployeeModel): boolean {

    return r1.DisciplineId === r2.DisciplineId
          && r1.EmployeeId === r2.EmployeeId
          && r1.StartDate === r2.StartDate
          && r1.HoursPerWeek === r2.HoursPerWeek
          && r1.NumberOfWeeks === r2.NumberOfWeeks;

  }

  public removeProjectResource(updateResource: UIProjectEmployeeModel): void {

    this.ProjectEmployee$.value.forEach((item, i) => {
      if (item.ProjectEmployeeId === updateResource.ProjectEmployeeId) {
        this.ProjectEmployee$.value.splice(i, 1);
        this.ProjectHasChanges$.next(true);
        this.ProjectEmployee$.next(this.ProjectEmployee$.value);
      }
    });
  }


  public addProjectResource(newResource: UIProjectEmployeeModel): UIProjectEmployeeModel {

   newResource.resetProjectSchedule();

   const projectMultiplier=this.SelectedProject$.value.projectDetail.multiplier;
   const projectOverheadRate=this.SelectedProject$.value.projectDetail.budgetOverheadRate;
   const jobCostRate=newResource.JobCostRate;


   const loadedRate=this.getLoadedRate(jobCostRate,projectMultiplier,projectOverheadRate, newResource.IsGenericResource);
   newResource.LoadedRate=loadedRate;

    this.ProjectEmployee$.value.push(newResource);
    this.ProjectEmployee$.next(this.ProjectEmployee$.value);
    this.ProjectHasChanges$.next(true);

    this.resetOtherSchedules(); // reset the other schedules in the project
    this.calculateMaxEndDateForResource(newResource);
    this.SelectedEmployee$.next(newResource);
    return newResource;
  }

  public getProjectResource(newResource: Employee): UIProjectEmployeeModel {

    const mondayOfThisWeek = DateFunctions.getMondayOfWeek(new Date().toDateString());
    const lastDayOfThisWeek=DateFunctions.addDays(mondayOfThisWeek,6);

    const newProjectEmployee = new UIProjectEmployeeModel(
        this.nextNewId--,
        newResource.id,
        newResource.name,
        newResource.profitCenter,
        newResource.disciplineId,
        'Select a discipline',
        newResource.supervisorName,
        newResource.location,
        newResource.loadedRate,
        newResource.jobCostRate,
        DateFunctions.dateStringToNgbDate(mondayOfThisWeek.toDateString()),
        DateFunctions.dateStringToNgbDate(lastDayOfThisWeek.toDateString()),
        40,
        1,
        newResource.isGenericResource,
        []);

    return newProjectEmployee;
  }

  private getLoadedRate(employeeJobCostRate: number, projectMultiplier: number, 
                        projectBudgetOverHeadRate: number, isGeneric: boolean)
  {
    //currently treating generic as employee
    //if (isGeneric)
    //{
    //  return employeeJobCostRate;
    //}

    if (projectMultiplier>0)
    {
      return projectMultiplier * employeeJobCostRate;
    }
    if (projectBudgetOverHeadRate>0)
    {
      return projectBudgetOverHeadRate;
    }

    return 1.5012 * employeeJobCostRate;

  }

  public projectDisciplinesChanged(disciplines: UIDisciplineModel[], userChangedValue = false): void {
    this.projectDiscipline$.next(disciplines);
    if  (userChangedValue) { // otherwise this is just calculating the other values
      this.ProjectHasChanges$.next(true);
    }
  }


  public resetOtherSchedules(): void {

    const employeeIds = this.ProjectEmployee$.value.map(e => e.EmployeeId);

    this.http.post<EmployeeOtherHours[]>(this.urlRoot + 'getOtherSchedules/' + this.SelectedProject$.value.projectDetail.projectId
      , employeeIds ).subscribe((result) => {
      this.EmployeeOtherSchedule$.next(result);
    });
  }

  public setProjectSchedule(): void {

    // calculate the max end date of the current project
   // this.calculateMaxEndDate();

    this.projectWeeklySchedule = [];
    // take the start week and generate the weekly schedule for 5 years

    let startWeekDt: Date = DateFunctions.getMondayOfWeek(this.SelectedProject$.value.projectDetail.startDate);
    let endWeekDt: Date = new Date(startWeekDt.toDateString());

    endWeekDt.setDate(endWeekDt.getDate() + 6);
    let nextWeek: WeeklySchedule = new WeeklySchedule(1, startWeekDt, endWeekDt);

    for (let i = 1; i <= 520; i++) {
      this.projectWeeklySchedule.push(nextWeek);

      startWeekDt = new Date(startWeekDt.toDateString());
      endWeekDt = new Date(endWeekDt.toDateString());
      startWeekDt.setDate(startWeekDt.getDate() + 7);
      endWeekDt.setDate(endWeekDt.getDate() + 7);
      nextWeek = new WeeklySchedule(i, startWeekDt, endWeekDt);
    }
  }

  public calculateMaxEndDate(): void {
      let minStartDate: Date;
      let maxEndDate: Date;

      // determine actual start date and end date
      this.ProjectEmployee$.value.forEach(resource => {

        const startDate: Date = DateFunctions.getMondayOfWeekFromNgb(resource.StartDate);
        var endDate: Date = DateFunctions.getMondayOfWeekFromNgb(resource.StartDate);

        if (resource.EmployeeSchedule.length) {
          
          endDate=this.latestStartDate(resource.EmployeeSchedule);

        } else {
          endDate.setDate(startDate.getDate() + ((resource.NumberOfWeeks-1) * 7) );
        }

        if (!minStartDate || startDate < minStartDate) {
          minStartDate = startDate;
        }
        if (!maxEndDate || endDate > maxEndDate) {
          maxEndDate = endDate;
        }
      });

      this.projectMaxEndDate = maxEndDate;
  }

  ///
  public calculateMaxEndDateForResource(resource: UIProjectEmployeeModel) {
    let minStartDate: Date;
    let maxEndDate: Date;

    const startDate: Date = DateFunctions.getMondayOfWeekFromNgb(resource.StartDate);
        var endDate: Date = DateFunctions.getMondayOfWeekFromNgb(resource.StartDate);

        if (resource.EmployeeSchedule.length) {
          
          endDate=this.latestStartDate(resource.EmployeeSchedule);
        } else {
          endDate.setDate(startDate.getDate() + ((resource.NumberOfWeeks-1) * 7) );
        }
        
        //end date calculates 
        endDate.setDate(endDate.getDate() + 6);

        if (!minStartDate || startDate < minStartDate) {
          minStartDate = startDate;
        }
        if (!maxEndDate || endDate > maxEndDate) {
          maxEndDate = endDate;
        }

        this.projectMaxEndDate = maxEndDate;
  }

  private latestStartDate(schedules:UICustomWeekModel[]): Date
  {
    let maxScheduleStartDate: Date;
    let weekNumber=0;
    schedules.forEach((schedule)=>
      {
        weekNumber++;

      const startDate: Date = DateFunctions.getMondayOfWeek(schedule.WeekStartDate.toString());
      if (!maxScheduleStartDate || startDate > maxScheduleStartDate) {
        maxScheduleStartDate = startDate;
      }
    });

    return maxScheduleStartDate;
  }

}
