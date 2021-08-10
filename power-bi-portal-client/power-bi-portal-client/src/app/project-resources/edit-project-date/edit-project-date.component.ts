import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateFunctions } from 'src/app/workbench/dateFunctions';
import { threadId } from 'worker_threads';
import { AreYouSureComponent } from '../are-you-sure/are-you-sure.component';

@Component({
  selector: 'app-edit-project-date',
  templateUrl: './edit-project-date.component.html',
  styleUrls: ['./edit-project-date.component.scss']
})
export class EditProjectDateComponent implements OnInit {
  public newStartDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public currentStartDate: Date;
  public projectAction: string="move";
  public daysDiff: number;
  public hasResourcesInPast: boolean=false;

  //private const ACTION_REMOVE: number = -1;
  //private const ACTION_CANCEL: number=0;

 form: FormGroup;
  
  constructor(public activeModal: NgbActiveModal,public fb: FormBuilder, private modalService:NgbModal) {

  this.form = fb.group({
    newStartDateNgb: { year: 2020, month: 5, day: 11 }
  });
  }

  ngOnInit(): void {
      this.form.controls.newStartDateNgb.setValue(this.newStartDate);
      this.minDate=this.newStartDate;
  }

  public updateStartDate(){

    console.log(this.form.controls.newStartDateNgb.value);
    console.log(this.currentStartDate);
    const mondayOfNewStartWeek = DateFunctions.getMondayOfWeekFromNgb(this.form.controls.newStartDateNgb.value);
    const mondayOfCurrentStartWeek = DateFunctions.getMondayOfWeek(this.currentStartDate.toDateString());
    this.daysDiff=DateFunctions.getNumberOfWeeksApart(mondayOfCurrentStartWeek,mondayOfNewStartWeek)*7;
    this.newStartDate = this.form.controls.newStartDateNgb.value;

  
  }


  public closeModalWithSave() {
   

    if (!this.formValid()) return;

    const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
    
   
    if (this.formValid())
    {
     
      const ACTION_REMOVE:number=-1;

    
      if (this.projectAction==="remove")
      {
        modalRef.componentInstance.displayText = 'that you want to proceed? This will remove all resources from your project.';
        modalRef.result.then((result) => {
          if (result.toString() === 'yes') {
            this.activeModal.close({newDate: null, days: ACTION_REMOVE});
          }
        });
      }
      else
      {
        modalRef.componentInstance.displayText = 'that you want to proceed? This will move the start date on all your project resources by ' + this.daysDiff.toString() + ' days.';
        modalRef.result.then((result) => {
          if (result.toString() === 'yes') {
            this.activeModal.close({newDate: this.newStartDate, days: this.daysDiff});
          }
        });
        
      }
    }
  } 

  public formValid():boolean{
      var newDate=DateFunctions.ngbDateToDate(this.newStartDate);
      var dateChanged: boolean=false;
      if (newDate>this.currentStartDate)
      {
        dateChanged=true;
      }

      if (dateChanged && (this.projectAction) )
      {
        return true;
      }
      else
      {
        return false;
      }
  }

  public getActionImage(optionToCheck:string) {
    if (optionToCheck===this.projectAction)
    {
      return "../../../assets/images/radio_button_checked-24px.svg";
    }
    else
    {
      return "../../../assets/images/radio_button_unchecked-24px.svg";
    }
  }
  public setAction(newAction: string) {
    this.projectAction=newAction;
  }

  public closeModalWithoutSave(){
    this.activeModal.close({newDate:null, days: 0})
    }


}
