import {  Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UIProjectEmployeeModel } from 'src/app/workbench/models/ui-models/ui-project-employee';
import { DateFunctions } from 'src/app/workbench/dateFunctions';

@Component({
  selector: 'app-date-change-notify',
  templateUrl: './date-change-notify.component.html',
  styleUrls: ['./date-change-notify.component.css']
})
export class DateChangeNotifyComponent implements OnInit {

  public displayText: string;
  public errors: string[] = [];
  public title = 'Confirm';
  public show: boolean = false;
  public projectAction: string='unload'; //default to exit without saving
  public invalidResources: UIProjectEmployeeModel[] = [];
  public projectStartDate: Date;
  public lastSavedStartDate: Date;
  public projectNumber: string;
  public numberOfDays: number;
  public hasResourcesInPast: boolean;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.show=true;
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

  public getDateDisplayText(dt: NgbDateStruct): string {
     return DateFunctions.formatDateForDisplay(dt);
  }

  public hasInvalid(): boolean {
     return (this.invalidResources && this.invalidResources.length>0);
  }

}
