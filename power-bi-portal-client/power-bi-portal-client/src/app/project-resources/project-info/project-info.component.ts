import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { ProjectInfo } from 'src/app/workbench/models/api-models/project-increment';
import { ProjectSelectionInfo } from 'src/app/workbench/models/project-selection-info';
import { FormGroup, FormBuilder } from '@angular/forms';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbModal, NgbTypeaheadSelectItemEvent, NgbModalOptions, NgbModule, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { EditProjectDateComponent } from '../edit-project-date/edit-project-date.component';
import { ProjectManager } from 'src/app/workbench/models/api-models/project-manager';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ProjectApiModel } from 'src/app/workbench/models/api-models/project-api-model';
import { AreYouSureComponent } from '../are-you-sure/are-you-sure.component';
import { ToastrService } from 'ngx-toastr';
import { UIProjectEmployeeModel } from 'src/app/workbench/models/ui-models/ui-project-employee';
import { timingSafeEqual } from 'crypto';
import { ActivatedRoute } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';
import { DateFunctions } from 'src/app/workbench/dateFunctions';
import { UICustomWeekModel } from 'src/app/workbench/models/ui-models/ui-custom-week';

@Component({
  selector: 'app-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss']
})
export class ProjectInfoComponent implements OnInit {
 
  faPencilAlt = faPencilAlt;
  public isCollapsed = false;
  public projectHasChanges = false;
  //project Type is project or OBE
  public projectType: string="";
  public projectResources: UIProjectEmployeeModel[] = [];
  public hasResourcesInPast: boolean=false;

  form: FormGroup;
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();


  constructor(private modalService: NgbModal,
              private workbenchService: WorkbenchService,
              public toastr: ToastrService,
              public fb: FormBuilder,
              private route: ActivatedRoute) {

    this.form = fb.group({
      projectManager: this.workbenchService.SelectedProjectManager$.value,
      projectNumber: this.selectedTopLevelProjectName,
      projectTask: this.selectedProjectTask,
      searchProjectControl: '',
    });

    workbenchService.ProjectEmployee$.subscribe((resources) => {
      this.projectResources = resources.filter((r)=>{return r.isCurrent});
      var pastResources= resources.filter((r)=>{return r.isCurrent===false});
      if (pastResources && pastResources.length>0)
      {
        this.hasResourcesInPast=true;
      }
      else
      {
        this.hasResourcesInPast=false;
      }
    });


    this.route.params.subscribe((params)=>{
      this.projectType=params['projectType'];
      const currProjectType=this.workbenchService.projectType;
      this.workbenchService.setProjectType(this.projectType);

      if (currProjectType!==this.projectType)
          {
            this.changeProjectManager(null, true);
            this.form.controls.projectManager.setValue(null);
            this.workbenchService.updateFilteredProjectList(null);

            this.workbenchService.getProjectManagers(this.projectType).subscribe((pmList) => {
              const blankPM: ProjectManager = {id: '', name:'(all)', firstName: '', lastName: ''};
              pmList.splice(0,0,blankPM);
             this.projectManagerList = pmList;
           });
          }
      
     } 
     );


    workbenchService.DisplayRate$.subscribe((showingRate) => {
      this.currentlyShowingRate = showingRate;
    });
    workbenchService.EditDisciplineStyle$.subscribe((style) => {
      this.currentlyShowingDisciplineAllocationStyle = style;
    });
    workbenchService.ProjectHasChanges$.subscribe((hasChanges) => {
      this.projectHasChanges = hasChanges;
    });
  }

  public currentlyShowingDisciplineAllocationStyle = 'PCT';
  public currentlyShowingRate = false;
  public projectInfoList: ProjectInfo[] = [];
  public topLevelProjectList: ProjectInfo[];
  public uniqueProjectManagers: string[] = [];
  public projectManagerList: ProjectManager[] = [];
  public uniqueProjectNumbers: string[] = [];
  public uniqueProjectTasks: string[] =  []; //['select project number'];
  public showSideMenu: boolean=true;
  public startDateEditable: boolean=false;

  public selectedTopLevelProject:ProjectInfo=null;
  public selectedTopLevelProjectName=''; 
  public selectedProjectNumber = '';
  public selectedProjectTask = ''; //'select project number';
  public selectedProjectManagerName='';
  public blurSearch: boolean=false;
  public showTaskInput: boolean=false;
  public newLoad: boolean=false;

  public selectedProjectInfo: ProjectInfo = null; // new ProjectInfo('', '', '', '', '' , '', '', '', '', '', 0);

  public currentlyEditingProject: ProjectApiModel = null;

  ngOnInit(): void {

    

    this.workbenchService.TopLevelProject$.subscribe((topLevelProjects)=> {
      this.topLevelProjectList=topLevelProjects;
    });

    this.workbenchService.FilteredProjectInfo$.subscribe((projects) => {

      this.projectInfoList = projects;
      // get list of unique project numbers
      this.uniqueProjectNumbers = [];
  

      if (projects && projects.length) {

        this.projectInfoList.forEach((p) => {
          const projNumberAndName=p.projectNumber + " " + p.projectName;
          if (!this.uniqueProjectNumbers.includes(projNumberAndName)) {
            this.uniqueProjectNumbers.push(projNumberAndName);
          }
        });
      }
    });

    this.workbenchService.SelectedProject$.subscribe((p) => {
      this.currentlyEditingProject = p;

      if (p)
      {
      this.selectedProjectInfo = this.projectInfoList.find((pInfo)=>{return pInfo.projectId===p.projectDetail.projectId}) ;
      if (this.topLevelProjectList && this.topLevelProjectList.length>0)
          {
            this.selectedTopLevelProject=this.topLevelProjectList.find((t)=>{return t.projectNumber===p.projectDetail.projectNumber});
           
            this.form.controls.searchProjectControl.setValue(this.selectedTopLevelProject);
            this.selectedTopLevelProjectName=this.selectedTopLevelProject.projectName;
            this.setUniqueProjectTasks(p.projectDetail);
            this.selectedProjectTask=p.projectDetail.projectTask + " " + p.projectDetail.projectName;
          }

        //When loading a new project, expand the discipline list if there are none.
        //collapse the list if there are any.
        

         ///If this is a newly loaded project, set whether discipline list is expanded
         if (this.newLoad)
         {

          let expandDisciplines=true;
          if (p.projectDisciplines && p.projectDisciplines.length>0)
          {
            expandDisciplines=false;
          }
          this.newLoad=false;
          this.workbenchService.DisplayAllDisciplines$.next(expandDisciplines);
         }
        
      }

      setTimeout(()=> {this.setPanelWidths(this.showSideMenu)}, 500);
    });


  }

  public editProjectStartDate(){
    const modalRef = this.modalService.open(EditProjectDateComponent, { centered: true });
          const startDate=new Date(this.selectedProjectInfo.startDate);
         
          modalRef.componentInstance.currentStartDate=startDate;
          modalRef.componentInstance.newStartDate=DateFunctions.dateStringToNgbDate(startDate.toDateString());
          modalRef.componentInstance.hasResourcesInPast=this.hasResourcesInPast;

          modalRef.result.then((result) => 
            {
              
              var resultNumber: number=+result.days;

              if (resultNumber>0)
              {
                const updatedStartDate: string =DateFunctions.formatDateForSave(result.newDate);
                
                this.adjustResourceDatesForProject(this.projectResources, resultNumber, updatedStartDate);
              }
              if (resultNumber<0)
              {
                this.removeResourceList(this.projectResources);
              }
              if (resultNumber===0)
              {
                this.toastr.success("Update Cancelled.");
              }
            }
            );
  }

  private adjustResourceDatesForProject(invalidResources: UIProjectEmployeeModel[], dayAdjustment: number, newProjectStartDate: string){
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

    this.workbenchService.updateCurrentProjectStartDate(newProjectStartDate);
    this.selectedProjectInfo.startDate=newProjectStartDate;
    this.toastr.success(msg);
  }

  private removeResourceList(invalidResources: UIProjectEmployeeModel[]){
    const msg="Removed " + invalidResources.length.toString() + " resource(s) from project. ";   
    
      invalidResources.forEach((resource)=>{
        this.workbenchService.removeProjectResource(resource);
      });

      this.workbenchService.saveCurrentProject();
      this.toastr.success(msg);
  }

  public toggleSideNav()
  {
    
    const newSideMenuDisplay=!this.showSideMenu;
    this.setPanelWidths(newSideMenuDisplay);
    this.showSideMenu=newSideMenuDisplay;
}    
    
public onWindowResize(event:any){
  this.setPanelWidths(this.showSideMenu);
}
   

  private setPanelWidths(displaySideMenu: boolean)
  {
    const sideMenuHeight=document.getElementById("sideNavExpanded").style.height;
    var leftMenu=0;
    var chevronLeft: number=0;
    if (displaySideMenu)
      {
       leftMenu=297;
       chevronLeft=47;
      }
    else
       {
        leftMenu=40;
        chevronLeft=304;
       }


       if (this.projectType.toLowerCase()==="obe")
       {
         chevronLeft+=100;
       }
      

       const chevronLeftString=chevronLeft.toString(10) + "px";

        const mainContentWidth=window.innerWidth - leftMenu-30;
        var resourceTableWidth=mainContentWidth-10;

       const leftMenuString=leftMenu.toString() + "px";
       const mainContentString=mainContentWidth.toString() + "px";
       const resourceTableWidthString=resourceTableWidth.toString() + "px";
       document.getElementById("sideNavExpanded").style.width = leftMenuString;
       document.getElementById("sideNavExpanded").style.height=sideMenuHeight;
       document.getElementById("pageContent").style.width=mainContentString;
       if(document.getElementById("resourceTableDiv"))
            document.getElementById("resourceTableDiv").style.width=resourceTableWidthString;

       const chevronImage=document.getElementById("disciplineChevronImage");
       if(chevronImage!=null)
       {
          chevronImage.style.marginLeft=chevronLeftString;
       }



    // this.showSideMenu=newSideMenuDisplay;
  }

  public updateDisplayRate(toggle: boolean): void {
    this.workbenchService.DisplayRate$.next(toggle);
  }
  public updateDisciplineAllocationStyle(style: string): void {
    this.workbenchService.EditDisciplineStyle$.next(style);
  }


  selectProjectManager(event: any): any {
      const pm: ProjectManager = event.item;
    this.changeProjectManager(pm);
  }

changeProjectManager(pm: ProjectManager, clearProject: boolean=true) {
    let pmId: string=null;
    if(pm)
    {
      pmId=pm.id;
    }

    
    if (pmId) {
      if (this.projectHasChanges && clearProject) {
        const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
        modalRef.componentInstance.displayText = 'that you want to clear your changes and load another project';
        modalRef.result.then((result) => {
            if (result.toString() === 'yes') {
              this.workbenchService.SelectedProjectManager$.next(pm);
              this.projectNumberChanged(null);
              this.workbenchService.ClearProject();
            } else {
            
              this.form.controls.projectManager.setValue(this.workbenchService.SelectedProjectManager$.value);
            }
        });
      } else  {
              this.workbenchService.SelectedProjectManager$.next(pm);
              if (clearProject)
              {
                this.projectNumberChanged(null);
                this.workbenchService.ClearProject();
              }
          }
    }
    else
    {
      this.workbenchService.SelectedProjectManager$.next(null);
      if (clearProject)
      {
        this.projectNumberChanged(null);
        this.workbenchService.ClearProject();
      }
    }
  }

  selectProjectNumber(event: any): void {
    if (event && event.item ) {
      event.preventDefault(); //stop text from overwriting
      const selectedProjNumber: string = event.item.projectNumber;
      this.selectedTopLevelProject=event.item;
      this.selectedTopLevelProjectName=this.selectedTopLevelProject.projectName;
      const newProject=this.projectInfoList.find((p)=>p.projectNumber===selectedProjNumber);
      
      if (!newProject)
      {
          return;
      }

      if (this.projectHasChanges) {
        const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
        modalRef.componentInstance.displayText = 'that you want to clear your changes and load another project';
        modalRef.result.then((result) => {
            if (result.toString() === 'yes') {
              this.projectNumberChanged(newProject);
              this.workbenchService.ClearProject();
            } else {
              event.target.value = this.currentlyEditingProject.projectDetail.projectNumber;
              // this.form.controls.selectedProjectName.setValue(this.currentlyEditingProject.projectDetail.projectNumber);
            }
        });
      } else  {
        this.projectNumberChanged(newProject );
        this.workbenchService.ClearProject();
      }
    }
  }
  projectNumberChanged(newProject: ProjectInfo): void {

    var newProjNumber:string='';
    if (newProject)
    {
      newProjNumber=newProject.projectNumber;
      const currPMId:string =this.selectedProjectManagerId();
      if (currPMId!==newProject.projectMgrId)
      {
        var newPM = this.projectManagerList.find((pm)=>{return pm.id===newProject.projectMgrId});
        this.workbenchService.SelectedProjectManager$.next(newPM);
        this.form.controls.projectManager.setValue(newPM);
      }
    }

    if (newProjNumber) {
      this.selectedProjectNumber = newProjNumber;
      this.uniqueProjectTasks = [];
      this.selectedProjectInfo=null;

      
      let projects: ProjectInfo[] = this.projectInfoList.filter(p => p.projectNumber === newProjNumber);
      
    
      if (projects && projects.length) {

            this.uniqueProjectTasks=projects.map((tsk)=> tsk.projectTask + " " + tsk.projectName);

            if (this.uniqueProjectTasks)
            {
                if (this.uniqueProjectTasks.length===1)
                {
                    this.projectTaskChanged(this.uniqueProjectTasks[0]);
                    this.showTaskInput=false;
                }
                else
                {
                   //this.uniqueProjectTasks.splice(0,0,'');
                   this.projectTaskChanged('');
                   this.focusTask();
                }
            }
      }
      }
      else
      {
            this.uniqueProjectTasks=[];
      
            this.selectedProjectNumber= newProjNumber;
            this.selectedProjectTask = '';
            this.projectTaskChanged('');
            this.selectedProjectInfo=null;
      }

    if (this.topLevelProjectList)
    {
      this.form.controls.searchProjectControl.setValue(this.topLevelProjectList.find((p)=>p.projectNumber===newProjNumber));
    }
  }

  focusTask() {
    if (this.uniqueProjectTasks && this.uniqueProjectTasks.length>1)
    {
      if (this.projectHasChanges){ 
        const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
        modalRef.componentInstance.displayText = 'that you want to clear your changes and load another project2';
        modalRef.result.then((result) => {
            if (result.toString() === 'yes') {

              this.projectTaskChanged('');
              this.showTaskInput=true;
              setTimeout(()=>this.focusOnTaskInput(),300);
              this.workbenchService.ClearProject();
            } else {
              ''
            }
        });

      }
      else
      {
        this.projectTaskChanged('');
        this.showTaskInput=true;
        setTimeout(()=>this.focusOnTaskInput(),300);
      }
    }
  }

   private focusOnTaskInput(){
     
    this.showTaskInput=true;
    const taskInput=document.getElementById("taskNumberInput");
   
    (taskInput as HTMLInputElement).select();
    taskInput.focus();
   }

  public setUniqueProjectTasks(project: ProjectInfo) {
    const projectNumber=project.projectNumber;
    const projectTask=project.projectTask + " " + project.projectName;

    let projects: ProjectInfo[] = this.projectInfoList.filter(p => p.projectNumber === projectNumber);
    
    if (projects && projects.length) {

          this.uniqueProjectTasks=projects.map((tsk)=> tsk.projectTask + " " + tsk.projectName);
         // if (this.uniqueProjectTasks.length>1)
         // {
         //   this.uniqueProjectTasks.splice(0,0,'');
         // }
     }

     this.selectedProjectNumber=projectNumber;
     this.form.controls.projectTask.setValue(projectTask);
     //this.projectTaskChanged(projectTask);
     //this.form.controls.projectTask.setValue(this.uniqueProjectTasks[1]);
    //this.selectedProjectTask=this.uniqueProjectTasks[1];
}


  public verifyProjectChange(event: any) {

    if (this.blurSearch)
    {
      setTimeout(()=>{this.blurSearch=false;
                      document.getElementById("taskNumberInput").focus();}
      ,1000);
      return;
    }

    if (this.projectHasChanges){ 
      const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
      modalRef.componentInstance.displayText = 'that you want to clear your changes and load another project';
      modalRef.result.then((result) => {
          if (result.toString() === 'yes') {
            this.workbenchService.ClearProject();
            event.target.select();
          } else {
            ;
            this.blurSearch=true;
          }
      });
    }
    else
    {
      event.target.select();
    }
  }

  public verifyTaskChange(event: any): void {
    //not sure if this is needed

  }


  changeProjectTask(event: any): any {

    const selectedTaskBefore=this.selectedProjectTask;

    if (event && event.item) {
      const projTask: string = event.item;
              if (this.projectHasChanges){ 
              const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
              modalRef.componentInstance.displayText = 'that you want to clear your changes and load another project2';
              modalRef.result.then((result) => {
                  if (result.toString() === 'yes') {

                    this.projectTaskChanged(projTask);
                    this.workbenchService.ClearProject();
                  } else {
                    this.form.controls.projectTask.setValue(selectedTaskBefore);
                  }
        });
      } else  {
        this.projectTaskChanged(projTask);
        this.workbenchService.ClearProject();
      }
    }
  }
  projectTaskChanged(projTask: string): void {

     this.showTaskInput=false;

    if (projTask) {
      this.selectedProjectTask = projTask;
      this.form.controls.projectTask.setValue(projTask);

      const projects: ProjectInfo[] = this.projectInfoList.filter(p => p.projectNumber === this.selectedProjectNumber
        && p.projectTask + " " + p.projectName === projTask);
      if (projects && projects.length) {
        this.selectedProjectInfo = projects[0];
      }
      else
      {
        this.selectedProjectInfo=null;
        this.selectedProjectTask='';
        this.form.controls.projectTask.setValue('');

      }
    }
    else
    {
      this.selectedProjectInfo=null;
      this.selectedProjectTask='';
      this.form.controls.projectTask.setValue('');

    }
  }

  // reload current project
  cancelEdits(): void {

    if (this.currentlyEditingProject && this.currentlyEditingProject.projectDetail ) {
      if (this.projectHasChanges) {

        const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
        modalRef.componentInstance.displayText = 'that you want to clear your changes';

        modalRef.result.then((result) => {
            if (result.toString() === 'yes') {
              this.toastr.info('Project reloaded');
              this.workbenchService.LoadProject(this.currentlyEditingProject.projectDetail.projectId);
            }
        });
      } else  {
        this.workbenchService.LoadProject(this.currentlyEditingProject.projectDetail.projectId);
      }
    }
  }

  loadProject(): void {
    this.newLoad=true;

    if (!this.projectHasChanges)
    {
        this.workbenchService.LoadProject(this.selectedProjectInfo.projectId);
        setTimeout(() => {
          this.setPanelWidths(this.showSideMenu);
        }, 600);
    }
  }

  // Project number Type Ahead
  projectResultFormatter = (project: ProjectInfo) => project.projectNumber ? project.projectNumber + "  " + project.projectName: "";
  projectFormatter = (project: ProjectInfo) => project.projectNumber ? project.projectNumber: "";
  projectManagerFormatter=(projectManager: ProjectManager)=> projectManager.name;

  searchProject= (text$: Observable<string>) => 

    text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => term.length< this.minProjectNumberTermLength(term)
      ? []
      : this.filterProjects(term)
      .sort()
    )
      
     );

     // ************************************************************************************************
     // This refers to the list of projects to search
     //  1.  If the Project Manager is selected, this returns a list of top level projects (no task)
     //  whose project manager is the currently selected project manager and whose projectName property
     //  (which is a concatenation of project number and name) contains the input searchTerm.
     //  2.  If the Project Manager is not selected, search all top level project names
     //      (which is a concatenation of project number and name) that contain the input searchTerm. 
     //
     //  Sort the final list by startdate in descending order.
     // ************************************************************************************************
    private filterProjects(searchTerm: string) {
      const term: string=searchTerm.toLowerCase();
      const pmId: string=this.selectedProjectManagerId();

      var returnList=[];
      
      if (pmId)
      {
        const pmProjList=this.topLevelProjectList.filter((p=>p.projectMgrId ===pmId));
        returnList= pmProjList.filter(p=>p.projectNumber.toLowerCase().indexOf(term)>-1 || p.projectName.toLowerCase().indexOf(term) >-1) 
      }
      else
      {
        returnList= this.topLevelProjectList.filter(p=>p.projectNumber.toLowerCase().indexOf(term)>-1 || p.projectName.toLowerCase().indexOf(term) >-1) 
      }

       return returnList.sort((a,b) => 
       {      if (a.startState <b.startDate)
                  return 1;
               else
                   return -1;
       });

    }

    searchTask = (text$: Observable<string>) => {
      const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
      const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
      const inputFocus$ = this.focus$;
    
  
  
      return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
        map(term => (term === '' ? this.uniqueProjectTasks
          : this.uniqueProjectTasks.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
      );
    }

    


     // Conditionally set minimum term length for searching project number.
     //If a project manager has been selected and number of projects in this list <100, show all (min length=0)
     // Otherwise, if the term is numeric (, in otherw words, searching for a year) let minimum be 4.
     // If a text search, let minimum be 3
     private minProjectNumberTermLength=(term: string):number=>
     {

       if (!term)
       {
         return 1;
       }
       if (this.projectInfoList.length<100)
       {
         return 0;
       }

       if (isNaN(parseFloat(term)))
       {
         return 3;
       }
       else
       { //for numeric values, make length 4, because of year
         return 3;
       }

     }

  searchProjectManager= (text$: Observable<string>) => 
    text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => term.length>555
      ? []
      : this.projectManagerList.filter(pm => pm.name.toLowerCase().indexOf(term.toLowerCase())>-1)
      .sort().slice(0, 10000))
      
     )



  search = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    map(term => this.projectManagerList.filter(employee => new RegExp(term, 'mi').test(employee.name)).slice(0, 100))
  )

  public lostProjectNumberFocus(): void {
    this.form.controls.searchProjectControl.setValue(this.topLevelProjectList.find((p)=> p.projectNumber=== this.selectedProjectNumber));
  }

  public lostTaskNumberFocus(): void {
    //leave this as blank for now.  Do we need this?
  }

  public lostProjectManagerFocus(): void {
    const pmEntered=this.form.controls.projectManager.value;
    if (pmEntered)
    {
    const pmId: string=this.selectedProjectManagerId();
    const pm: ProjectManager=this.projectManagerList.find(pm=>pm.id===pmId);
    this.form.controls.projectManager.setValue(pm);
    }
    else
    {
      this.changeProjectManager(null);
    }
  }

  public selectedProjectManagerId():string{
    const pm: ProjectManager=this.workbenchService.SelectedProjectManager$.value;
    if (pm)
    {
      return pm.id;
    }
    else
    {
      return "";
    }

  }


  public selectItem(event: NgbTypeaheadSelectItemEvent): void {
    if (event.item) {
      this.workbenchService.addProjectResource(event.item);
      this.form.controls.newResourceName.setValue('');
      event.preventDefault();
    }
  }

  public Save(): void {
    this.workbenchService.saveCurrentProject();
  }

}
