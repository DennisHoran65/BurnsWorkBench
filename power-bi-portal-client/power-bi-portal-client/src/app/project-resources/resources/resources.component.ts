import { Component, OnInit, ViewChild } from '@angular/core';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UIProjectEmployeeModel } from 'src/app/workbench/models/ui-models/ui-project-employee';
import { NgbModal, NgbTypeaheadSelectItemEvent, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { Employee } from 'src/app/workbench/models/api-models/employee';
import { UIDisciplineModel } from 'src/app/workbench/models/ui-models/ui-discipline';
import { DateFunctions } from 'src/app/workbench/dateFunctions';
import { AreYouSureComponent } from '../are-you-sure/are-you-sure.component';
import { DateChangeNotifyComponent } from '../date-change-notify/date-change-notify.component';
import { ResourceEditModalComponent} from '../resource-edit-modal/resource-edit-modal.component';
import { DisciplineInfo } from 'src/app/workbench/models/api-models/discipline-info';
import { ToastrService } from 'ngx-toastr';
import { NgbDateStructAdapter } from '@ng-bootstrap/ng-bootstrap/datepicker/adapters/ngb-date-adapter';
import { invalid } from '@angular/compiler/src/render3/view/util';
import { UICustomWeekModel } from 'src/app/workbench/models/ui-models/ui-custom-week';
import { EditProjectDateComponent } from '../edit-project-date/edit-project-date.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ElementSchemaRegistry } from '@angular/compiler';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  public projectResources: UIProjectEmployeeModel[] = [];
  public selectedResourceId: number = null;
  public selectedResource: UIProjectEmployeeModel = null;
  public disciplineList: UIDisciplineModel[] = [];
  public editDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public displayRate = false;
  model: NgbDateStruct;
  public employees: Employee[] = [];
  private startDate: NgbDateStruct = { year: 2020, month: 5, day: 11 };
  private projectStartDate: Date;
  private lastSavedStartDate: Date;
  private projectNumber: string;
  private resourcesChecked: boolean = false;
  public scrollEvent: any;
  public scrollUpEnabled: boolean= false;
  public scrollDownEnabled: boolean= true;
  public scrollVisible: boolean;
  public projectType: string;
  public minSearchLength: number=2;


  form: FormGroup;
  constructor(private modalService: NgbModal, private workbenchService: WorkbenchService,
              public fb: FormBuilder, public datePipe: DatePipe, public toastr: ToastrService,) {

    // all messages on this page are validation items
    this.toastr.toastrConfig.timeOut = 4000;

    this.form = fb.group({
      resourceName: '123',
      resourceDiscipline: 0,
      resourceStartDate: { year: 2020, month: 5, day: 11 },
      dateExample: { year: 2020, month: 5, day: 11 },
      resourceHoursPerWeek: 0,
      resourceNumberOfWeeks: 0,
      resourceHasOverride: false,
      resourceCustomHoursPerWeek: [0, 0, 0],
      newResourceName: ''
    });

    workbenchService.ProjectEmployee$.subscribe((resources) => {


      this.projectResources = resources.filter((r)=>{return r.isCurrent});

      this.checkResourceDates();
      setTimeout(() => {
        this.scrollVisible=this.isScrollVisible();
      }, 1000); 
    });

    workbenchService.ProjectType$.subscribe((pt: string)=>{
       this.projectType=pt;
       if (pt==="project")
        {
          this.minSearchLength=2;
        }
        else
        {
          this.minSearchLength=0;
        }
       
    });

    workbenchService.DisplayRate$.subscribe((showRate) => {
      this.displayRate = showRate;
    });

    workbenchService.getEmployees().subscribe((e) => {
      this.employees = e;
    });

    const monday = DateFunctions.getMondayOfWeek(new Date().toDateString());
    this.minDate = new NgbDate(monday.getFullYear(), monday.getMonth() + 1, monday.getDate());
  }

  ngOnInit(): void {
    this.loadDisciplines();
    this.loadProjectInfo();
  }

  formatter = (employee: Employee) => employee.name;

  search = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    filter(term => term.length >= this.minSearchLength),
    map(term => this.filteredEmployees()
      .filter(employee => new RegExp(term, 'mi')
      .test(employee.name))
      .sort((e1,e2)=> {
                        if (e1.lastName + e1.firstName < e2.lastName+e2.lastName)
                                  return -1;
                        else
                                   return 1;})
      //.slice(0, 10)
      )
  )

  /*
     For projects, return all employees
     For obes, return only generic resouces
  */
  private filteredEmployees(): Employee[] {
    const filteredDisciplineList=this.disciplineList.filter((discipline:UIDisciplineModel)=>{return discipline.pctAmount>0; });
    const filteredDisciplineIds=filteredDisciplineList.map((d)=>{return d.disciplineId});

    //For projects - return all actual resources (not generic)
    //and only those generic resources whose discipline is in this project
     if (this.projectType.toLowerCase()==="project")
     {
      return this.employees.filter((e)=>{
        return e.isGenericResource===false  || filteredDisciplineIds.indexOf(e.disciplineId)>-1;
      });
     }
     else
     {
     
       return this.employees.filter((e)=>{
         return e.isGenericResource===true  && filteredDisciplineIds.indexOf(e.disciplineId)>-1;
       });
     }

  }

  public lostFocus(): void {
  }

  public searchOnFocus(): void {
   //this.search("");
  }

  public selectItem(event: NgbTypeaheadSelectItemEvent): void {
    if (event.item) {
      //const newProjectEmployee = this.workbenchService.addProjectResource(event.item);
      this.form.controls.newResourceName.markAsTouched();
      this.form.controls.newResourceName.setValue('');

       event.preventDefault();
      const newResource: UIProjectEmployeeModel= this.workbenchService.getProjectResource(event.item);
      const selectedEmployee: Employee=this.employees.find((e)=>{return e.id===newResource.EmployeeId});
      let isGeneric: boolean=false;
      if(selectedEmployee)
      {
           isGeneric=selectedEmployee.isGenericResource;
      }

      this.editResourceModal(newResource, true, isGeneric);
     
    }
  }

  private editResourceModal(newResource: UIProjectEmployeeModel, isNew: boolean, isGeneric: boolean) {
    const modalRef = this.modalService.open(ResourceEditModalComponent, { centered: true });
    modalRef.componentInstance.resource=newResource;
    modalRef.componentInstance.displayRate=this.displayRate;
    modalRef.componentInstance.availableDisciplines=this.getDisciplinesToShowForUser(newResource);
    if (isGeneric)
    {
      modalRef.componentInstance.setInputDiscipline(newResource.DisciplineId, false);
    }
    setTimeout(()=>{
    modalRef.result.then((result) =>{ 
      if (result) {
        if (isNew)
        {
        this.workbenchService.addProjectResource( newResource);
        this.selectedResource=newResource;
        this.selectedResourceId = newResource.ProjectEmployeeId;
        }
        else
        {
          this.workbenchService.updateProjectResource(newResource, true);
        }

           setTimeout(()=>{
           if (isNew)
            {
              var objDiv = document.getElementById("resourceTbody");
               objDiv.scrollTop = objDiv.scrollHeight;
            }

            }, 200);
      }
    }).catch((err)=>{
      console.log("Error");
      console.log(err);
    }) 
    ;
  }, 100);
  }




  public scrollDown(): void {
    if (!this.scrollEvent)
    {
    this.scrollEvent=setInterval(()=>{
                 var element=document.getElementById('resourceTbody');
                 this.scrollUpEnabled=true;
                 if ((element.scrollTop + element.clientHeight)<element.scrollHeight)
                 {
                     element.scrollBy(0,40);
                 }

                 this.scrollDownEnabled = ((element.scrollTop + element.clientHeight)<element.scrollHeight);

                 },200 );
    }
    
  }

  public scrollUp(): void {
    if (!this.scrollEvent)
    {
    this.scrollEvent=setInterval(()=>{
                 var element=document.getElementById('resourceTbody');
                 this.scrollDownEnabled=true;

                 if (element.scrollTop>0)
                 {
                     element.scrollBy(0,-40);
                 }
                 this.scrollUpEnabled=element.scrollTop>0
                 },200 );
    }
    
  }

  public stopScrollTable()
  {

      clearInterval(this.scrollEvent);
      this.scrollEvent=null;
  }

  public isScrollVisible(): boolean {
    var element=document.getElementById('resourceTbody');
    return element.scrollHeight>element.clientHeight;
  }


  getDisciplinesToShowForUser(resource: UIProjectEmployeeModel): UIDisciplineModel[] {
    const availableDisciplines: UIDisciplineModel[] = [];

    // add current discipline first if they have one
    const currentDisp = this.disciplineList.filter(d => d.disciplineId.toString() === resource.DisciplineId.toString());
    if (currentDisp && currentDisp.length) {
      availableDisciplines.push(currentDisp[0]);
    } else {
      // add a blank one prompting them to select one
      availableDisciplines.push(new UIDisciplineModel(new DisciplineInfo(0, 'Select a discipline', 1), null));
    }

    this.disciplineList.forEach((d) => {
      if (
        (d.pctAmount > 0 || d.allocatedHours > 0)  // discipline has data
        && d.disciplineId.toString() !== resource.DisciplineId.toString() // current discipline added above to be first
      ) {
        availableDisciplines.push(d);
      }
    });

  
    return availableDisciplines;
  }

  private loadDisciplines() {
    this.workbenchService.projectDiscipline$.subscribe((disiplines) => {
      this.disciplineList = [];
      disiplines.forEach(d => {
        this.disciplineList.push(d);
      });
    });
  }

    private loadProjectInfo(){
    this.workbenchService.SelectedProject$.subscribe((p) => {
      if (p)
      {
          const startDateString=p.projectDetail.startDate;
          const lastSavedStartDateString=p.projectDetail.lastSavedStartDate;
          this.projectNumber=p.projectDetail.projectNumber;
          if (startDateString)
          {
            this.projectStartDate=new Date(startDateString);
            this.lastSavedStartDate= new Date(lastSavedStartDateString);
            this.checkResourceDates();

          }
          this.workbenchService.SelectedEmployee$.subscribe((employee)=> {
             this.selectedResource=employee;
             if (employee)
             {
             this.selectedResourceId = employee.ProjectEmployeeId;
             }
             else
             {
               this.selectedResourceId=null;
             }
          });
     }
    });
  }
  
  private checkResourceDates(){

    if (this.projectStartDate 
        && this.projectResources
        && !this.resourcesChecked
        && this.projectResources 
        && this.projectResources.length>0
        && DateFunctions.getMondayOfWeek(this.projectStartDate.toDateString()) >
           DateFunctions.getMondayOfWeek(this.lastSavedStartDate.toDateString()))
    {
        const invalidResources=this.projectResources.filter((r)=>
                        {  const dt = DateFunctions.ngbDateToDate(r.StartDate);
                          return dt < this.projectStartDate;  
                        });

        //if (invalidResources && invalidResources.length>0)
        //  {
            const earliestResourceDate=this.getEarliestDate(invalidResources);
            const todaysDate=new Date();
            const projectStartBeginningOfWeek=DateFunctions.getMondayOfWeek(this.projectStartDate.toDateString());
            const lastSavedStartBeginningOfWeek=DateFunctions.getMondayOfWeek(this.lastSavedStartDate.toDateString());
            const msDiff=projectStartBeginningOfWeek.getTime() - lastSavedStartBeginningOfWeek.getTime();
            var dayDiff: number=msDiff / (1000 * 60 * 60*24);
            dayDiff=(parseInt(dayDiff.toString()));

            this.resourcesChecked=true;

            const modalRef = this.modalService.open(DateChangeNotifyComponent, { centered: true });
            
            modalRef.componentInstance.invalidResources=invalidResources;
            modalRef.componentInstance.projectStartDate=this.projectStartDate;
            modalRef.componentInstance.lastSavedStartDate=this.lastSavedStartDate;
            modalRef.componentInstance.projectNumber=this.projectNumber;
            modalRef.componentInstance.numberOfDays=dayDiff;
            modalRef.componentInstance.hasResourcesInPast= earliestResourceDate < todaysDate ? true : false;
            modalRef.result.then((result) => 
            {
              if (result==="remove") {
                {
                    this.removeResourceList(invalidResources);
                }
              }
              
             if (result==="changeDate")
                    this.adjustResourceDatesForProject(this.projectResources, dayDiff);

              if (result==="unload")
              {
                this.workbenchService.ClearProject();
              }

              this.resourcesChecked=true;
              //do nothing if result is "none"

            });

            
        //  }

          this.resourcesChecked=true;
      }
  }

  private getEarliestDate(invalidResources: UIProjectEmployeeModel[]): Date {
      let earliestDate=this.projectStartDate;
        invalidResources.forEach((e)=>{
             const thisDate=DateFunctions.ngbDateToDate(e.StartDate);
             if(thisDate<earliestDate)
             {
               earliestDate=thisDate;
             }

             e.EmployeeSchedule.forEach((s: UICustomWeekModel)=> {
               if (s.WeekStartDate<earliestDate)
                {
                  earliestDate=s.WeekStartDate;
                }
             });

            });   
        return earliestDate;
  }


  private removeResourceList(invalidResources: UIProjectEmployeeModel[]){
    const msg="Removed " + invalidResources.length.toString() + " resource(s) from project. Save the project to complete the update.";   
    
      invalidResources.forEach((resource)=>{
        this.workbenchService.removeProjectResource(resource);
      });

      this.toastr.success(msg);
  }


  private adjustResourceDatesForProject(invalidResources: UIProjectEmployeeModel[], dayAdjustment: number){
    const msg="Adjusted dates for  " + invalidResources.length.toString() + " resource(s). Save the project to complete the change.";   

    invalidResources.forEach((resource)=>{

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
         this.workbenchService.updateProjectResource(resource, true);
    });

    this.toastr.success(msg);
  }
 

  public startDateInvalid(resource: UIProjectEmployeeModel): boolean {

    const resourceDate= DateFunctions.ngbDateToDate(resource.StartDate);
    const projectStartBeginningOfWeek=DateFunctions.getMondayOfWeek(this.projectStartDate.toString());
    return resourceDate<projectStartBeginningOfWeek;
  }

  public setActiveResource(resource)
  {
    this.workbenchService.setSelectedResource(resource);
    if (resource) {
      this.selectedResourceId = resource.ProjectEmployeeId;
      this.selectedResource = resource;
      this.form.controls.newResourceName.setValue('');
    }
    else
    {
      this.selectedResourceId = null;
      this.selectedResource = null;
    }
  }

  public editResource(resource: UIProjectEmployeeModel): void {
    
      this.setActiveResource(resource);
      const selectedEmployee=this.employees.find((e)=>{return e.id===resource.EmployeeId});
      let isGenericResource=false;
      if (selectedEmployee)
      {
        isGenericResource=selectedEmployee.isGenericResource;
      }

      this.editResourceModal(resource, false, isGenericResource);
      // clear the search form
      this.form.controls.newResourceName.setValue('');

    
  }

  public canEditDiscipline(): boolean {
    if (this.selectedResource)
    {
    const mondayOfStartWeek = DateFunctions.getMondayOfWeekFromNgb(this.selectedResource.StartDate);
    const mondayOfThisWeek = DateFunctions.getMondayOfWeek(new Date().toDateString());
    const isCurrentWeek: boolean= mondayOfStartWeek.getTime() >= mondayOfThisWeek.getTime();
    return isCurrentWeek;
    }
    else
    {
      return false;
    }
  }

  public canEditStartDate(): boolean {

    if (!this.selectedResource)
    {
      return false;
    }

    const mondayOfStartWeek = DateFunctions.getMondayOfWeekFromNgb(this.selectedResource.StartDate);
    const mondayOfThisWeek = DateFunctions.getMondayOfWeek(new Date().toDateString());
    const isCurrentWeek: boolean= mondayOfStartWeek.getTime() >= mondayOfThisWeek.getTime();
    const invalidStart: boolean=this.startDateInvalid(this.selectedResource);
    const hasOverride: boolean =this.selectedResource.hasOverride();

    if (invalidStart)
    {
      return true;
    }
    else
    {
      return isCurrentWeek && ! hasOverride;
    }
  }

 

  public resetCustomSchedule(resource: UIProjectEmployeeModel): void {
    const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
    
    modalRef.componentInstance.displayText = 'that you want to clear this employees schedule';

    modalRef.result.then((result) => {
        if (result.toString() === 'yes') {
          resource.EmployeeSchedule = [];
          this.workbenchService.updateProjectResource(this.selectedResource, true);
        }
    });
  }

  public deleteResource(resource: UIProjectEmployeeModel): void {
    const modalRef = this.modalService.open(AreYouSureComponent,  { centered: true });
    modalRef.componentInstance.displayText = 'that you want to remove this resource from this project';

    modalRef.result.then((result) => {
        if (result.toString() === 'yes') {
          this.workbenchService.removeProjectResource(this.selectedResource);
          this.workbenchService.setSelectedResource(null);
        }
    });
  }

  public disciplineDisplay(disciplineName: string): string {
    return disciplineName.replace("/", "/ ");
  }
}
