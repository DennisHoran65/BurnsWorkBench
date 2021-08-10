import {  Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { UIProjectEmployeeModel } from 'src/app/workbench/models/ui-models/ui-project-employee';
import { DateFunctions } from 'src/app/workbench/dateFunctions';
import { UIDisciplineModel } from 'src/app/workbench/models/ui-models/ui-discipline';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AreYouSureComponent } from '../are-you-sure/are-you-sure.component';


@Component({
  selector: 'app-resource-edit-modal',
  templateUrl: './resource-edit-modal.component.html',
  styleUrls: ['./resource-edit-modal.component.scss']
})

export class ResourceEditModalComponent implements OnInit {

 
  public resource: UIProjectEmployeeModel=null;
  public show: boolean = false;
  public displayRate: boolean=true;
  public availableDisciplines: UIDisciplineModel[]
  public minDate: NgbDateStruct;
  public disciplineEnabled: boolean=true;

  public inputDisciplineid: number=0;
  public inputDiscipline: string;
  public inputStartDate: NgbDateStruct;

  form: FormGroup;

  constructor(public activeModal: NgbActiveModal, public fb: FormBuilder, public toastr: ToastrService, private modalService:NgbModal) {

  this.form = fb.group({
    resourceDiscipline: 0,
    resourceStartDate: { year: 2020, month: 5, day: 11 },
    dateExample: { year: 2020, month: 5, day: 11 },
    resourceHoursPerWeek: 0,
    resourceNumberOfWeeks: 0
  });
}

  ngOnInit() {

    const monday = DateFunctions.getMondayOfWeek(new Date().toDateString());
    const sunday= DateFunctions.addDays(monday, 6);
    this.minDate = new NgbDate(sunday.getFullYear(), sunday.getMonth() + 1, sunday.getDate());

    if (this.resource)
      {
        this.inputDisciplineid=this.resource.DisciplineId;
        this.inputDiscipline =this.resource.Discipline;
        this.inputStartDate=this.resource.StartWeekEndDate;

        this.form.controls.dateExample.setValue(this.resource.StartWeekEndDate);
        this.form.controls.resourceDiscipline.setValue(this.resource.DisciplineId);
        this.form.controls.resourceHoursPerWeek.setValue(this.resource.HoursPerWeek);
        this.form.controls.resourceNumberOfWeeks.setValue(this.resource.NumberOfWeeks);

      }
  }


  
  public updateResourceDiscipline(event: any): void {
    if (event && event.target && event.target.value) {
      const disciplineId: number = event.target.value;
      this.setInputDiscipline(disciplineId);
    }
  }

  public updateResource(): void {
    const hoursPerWeek: number = +this.form.controls.resourceHoursPerWeek.value;
    const numberOfWeeks: number = +this.form.controls.resourceNumberOfWeeks.value;
    const errorConfig={closeButton: true, timeOut: 0, extendedTimeOut: 0,enableHtml: true };
    const buttonText="<br /><center><font color=\"blue\"><b><u>OK</u></b></font></center>"


    if (hoursPerWeek <= 0) {
      this.form.controls.resourceHoursPerWeek.setValue(this.resource.HoursPerWeek);
      this.toastr.error('Hours per week should be greater than zero.' + buttonText, 'Validation error', errorConfig);
      return;
    }

    if (numberOfWeeks > 110 || numberOfWeeks < 0) {
      this.form.controls.resourceNumberOfWeeks.setValue(this.resource.NumberOfWeeks);
      this.toastr.error('Number of weeks can not exceed 110.' + buttonText, 'Validation error', errorConfig);
      return;
    }

    // duration can not be less that current week - start week
    const mondayOfStartWeek = DateFunctions.getMondayOfWeekFromNgb(this.form.controls.dateExample.value);
    const endOfStartWeek=DateFunctions.addDays(mondayOfStartWeek, 6);
    const mondayOfThisWeek = DateFunctions.getMondayOfWeek(new Date().toDateString());
    const minDurationValue = DateFunctions.getNumberOfWeeksApart(mondayOfStartWeek, mondayOfThisWeek);
    const startDateInPast = mondayOfThisWeek.getTime() > mondayOfStartWeek.getTime();


    if (numberOfWeeks < minDurationValue && startDateInPast) {
      this.form.controls.resourceNumberOfWeeks.setValue(this.resource.NumberOfWeeks);
      this.toastr.error('Duration can not be before the current week.' + buttonText, 'Validation error', errorConfig);
      return;
    }

    const didResourceChange = !(this.resource.StartWeekEndDate === this.form.controls.dateExample.value
                              && this.resource.HoursPerWeek === hoursPerWeek
                              && this.resource.NumberOfWeeks === numberOfWeeks
                              && this.resource.DisciplineId===this.inputDisciplineid);


    this.resource.StartDate = DateFunctions.dateStringToNgbDate(mondayOfStartWeek.toDateString());
    this.resource.StartWeekEndDate= DateFunctions.dateStringToNgbDate(endOfStartWeek.toDateString());
    this.resource.HoursPerWeek = hoursPerWeek;
    this.resource.NumberOfWeeks = numberOfWeeks;
    this.resource.Discipline=this.inputDiscipline;
    this.resource.DisciplineId=this.inputDisciplineid;
  }

  public canEditDiscipline(): boolean {
   return this.startDateNotInPast();
  }

   public startDateNotInPast(): boolean {
    const mondayOfStartWeek = DateFunctions.getMondayOfWeekFromNgb(this.resource.StartDate);
    const mondayOfThisWeek = DateFunctions.getMondayOfWeek(new Date().toDateString());
    const isCurrentWeek: boolean= mondayOfStartWeek.getTime() >= mondayOfThisWeek.getTime();
    return isCurrentWeek;
   }

  public startDateInvalid(): boolean {
    return false;
  }

  public canEditStartDate(): boolean {

    // start date can be edited if not saved to db yet.
     if (this.resource.ProjectEmployeeId===0)
     {
       return true;
     }
     else
     {
       return this.startDateNotInPast();
     }
  }

  public updateStartDate(){

    const mondayOfStartWeek = DateFunctions.getMondayOfWeekFromNgb(this.form.controls.dateExample.value);
    const endOfStartWeek=DateFunctions.addDays(mondayOfStartWeek,6);

    const endOfWeekNGB=DateFunctions.dateStringToNgbDate(endOfStartWeek.toDateString());
    
    if (endOfWeekNGB!=this.resource.StartWeekEndDate)
    {
      this.inputStartDate=endOfWeekNGB;
    }
    
  
  }

  public closeModalWithResource() {
    if (this.formValid())
    {
      this.updateResource();;
     this.activeModal.close(this.resource);
    }
  } 

  public closeModalWithoutResource(){
      const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
      
      modalRef.componentInstance.displayText = 'that you want to cancel your changes for this resource';
  
      modalRef.result.then((result) => {
          if (result.toString() === 'yes') {
            this.activeModal.close(null);
          }
      });
    }


  public formValid():boolean {
     return this.validDiscipline() 
     && this.validHoursPerWeek()
     && this.validNumberOfWeeks()
     && this.validStartDate();
  }

  public validDiscipline():boolean {
    return this.inputDisciplineid>0;
  }

  public validHoursPerWeek(): boolean {
    var inputHoursPerWeek: number= +this.form.controls.resourceHoursPerWeek.value;
      if (this.resource.hasOverride())
      {
        return true;
      }
      

      if (inputHoursPerWeek <= 0)
      {
        return false;
      }
      else
      {
        return true;
      }
  }

  public validNumberOfWeeks(): boolean {
    var inputNumberOfWeeks: number= +this.form.controls.resourceNumberOfWeeks.value;
    if (this.resource.hasOverride())
    {
      return true;
    }
    

    if (inputNumberOfWeeks>110 || inputNumberOfWeeks<=0)
    {
      return false;
    }
    else
    {
      return true;
    }
}

   public validStartDate(): boolean {
    const mondayOfStartWeek = DateFunctions.getMondayOfWeekFromNgb(this.inputStartDate);
    const mondayOfThisWeek = DateFunctions.getMondayOfWeek(new Date().toDateString());
    const minDurationValue = DateFunctions.getNumberOfWeeksApart(mondayOfStartWeek, mondayOfThisWeek);
    const startDateInPast = mondayOfThisWeek.getTime() > mondayOfStartWeek.getTime();
    const inputNumberOfWeeks: number=+this.form.controls.resourceNumberOfWeeks.value;


    if (inputNumberOfWeeks < minDurationValue && startDateInPast) {
      return false;
     }
     else
     {
       return true;
     }
   }


  public setInputDiscipline(disciplineId: number, enableSelect: boolean=true): void {
    const disciplineChanged = this.resource.DisciplineId.valueOf() !== disciplineId.valueOf();
    this.disciplineEnabled = enableSelect;

    this.inputDisciplineid = disciplineId.valueOf();
    // set discipline text so it displays on screen
    const selectedDiscipline = this.availableDisciplines.filter(d => d.disciplineId.toString() === disciplineId.toString());
    if (selectedDiscipline && selectedDiscipline.length) {
      this.inputDiscipline = selectedDiscipline[0].disciplineName;
      this.resource.Discipline=this.inputDiscipline;
    }
  }

  

}
