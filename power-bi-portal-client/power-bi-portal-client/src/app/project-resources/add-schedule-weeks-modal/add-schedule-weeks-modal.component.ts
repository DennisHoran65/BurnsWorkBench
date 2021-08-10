import {  Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UIProjectEmployeeModel } from 'src/app/workbench/models/ui-models/ui-project-employee';
import { DateFunctions } from 'src/app/workbench/dateFunctions';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-schedule-weeks-modal',
  templateUrl: './add-schedule-weeks-modal.component.html',
  styleUrls: ['./add-schedule-weeks-modal.component.css']
})
export class AddScheduleWeeksComponent implements OnInit {

  public resourceName: string;
  public defaultDate: Date;
  public minDate: NgbDateStruct;
  public firstWeekEndDate: NgbDateStruct;
  public hoursPerWeek: number;
  public numberOfWeeks: number;
  public confirmAdd: boolean;
  public errors: string[] = [];

  form: FormGroup;

  constructor(public activeModal: NgbActiveModal, public fb: FormBuilder, public toastr: ToastrService, private modalService:NgbModal)
    {
    this.form = fb.group({
      dt: { year: 2020, month: 5, day: 11 },
      resourceHoursPerWeek: 40,
      resourceNumberOfWeeks: 1
    });
  }




  ngOnInit() {
    
   this.minDate = new NgbDate(this.defaultDate.getFullYear(), this.defaultDate.getMonth() + 1, this.defaultDate.getDate());
   // this.minDate = new NgbDate(this.defaultDate.getFullYear(), this.defaultDate.getMonth() + 1, this.defaultDate.getDate());
    this.firstWeekEndDate=this.minDate;

    this.form.controls.dt.setValue(this.firstWeekEndDate);
    
  }

  public formValid(): boolean {
    return this.validHoursPerWeek() && this.validNumberOfWeeks() && this.validStartDate();
  }

  public updateStartDate(evt: any)
  {

    const sundayOfWeek = DateFunctions.getSundayOfWeekFromNgb(this.form.controls.dt.value);
    const sundayNGB=DateFunctions.dateStringToNgbDate(sundayOfWeek.toDateString());


    if (!this.datesEqual(sundayNGB,this.form.controls.dt.value))
    {
      this.form.controls.dt.setValue(sundayNGB);
    }
    else
    {
      console.log("something else happening?");
    }
  }

  private datesEqual(d1: NgbDateStruct, d2: NgbDateStruct): boolean {
    return (d1.year===d2.year) && (d1.month===d2.month) && (d1.day===d2.day);
  }

  public validStartDate(): boolean {
    const firstWeekEndDate: Date= DateFunctions.ngbDateToDate(this.form.controls.dt.value);
    const minStartDate: Date = DateFunctions.ngbDateToDate(this.minDate);
    return (firstWeekEndDate.getTime()>=minStartDate.getTime());
     
  }

  public validHoursPerWeek(): boolean {
    
    const hoursPerWeek: number=this.form.controls.resourceHoursPerWeek.value;
      if (hoursPerWeek <= 0) //used to have max 120
      {
        return false;
      }
      else
      {
        return true;
      }
  }

  public validNumberOfWeeks(): boolean {
    
    const numberOfWeeks: number=this.form.controls.resourceNumberOfWeeks.value;
    if (numberOfWeeks >110 || numberOfWeeks<=0)
    {
      return false;
    }
    else
    {
      return true;
    }
}
 public closeModal(confirmSave: boolean) {
  if (confirmSave && !this.formValid())
  {
    return;
  }

  this.confirmAdd=confirmSave;
  this.numberOfWeeks=+(this.form.controls.resourceNumberOfWeeks.value);
  this.hoursPerWeek=+(this.form.controls.resourceHoursPerWeek.value);
  this.firstWeekEndDate=this.form.controls.dt.value;
  this.activeModal.close(
    {confirmAdd: this.confirmAdd,
    numberOfWeeks: this.numberOfWeeks,
    hoursPerWeek: this.hoursPerWeek,
    firstWeekEndDate: this.firstWeekEndDate}
  );
 }
 

}
