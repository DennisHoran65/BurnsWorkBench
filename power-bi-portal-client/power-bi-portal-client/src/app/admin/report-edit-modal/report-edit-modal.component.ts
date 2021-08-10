import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportCategoryListInfo, ReportDescriptionInfo } from 'src/app/models/report-list-info';
import { AreYouSureComponent } from 'src/app/project-resources/are-you-sure/are-you-sure.component';

@Component({
  selector: 'app-report-edit-modal',
  templateUrl: './report-edit-modal.component.html',
  styleUrls: ['./report-edit-modal.component.scss']
})
export class ReportEditModalComponent implements OnInit {
report: ReportDescriptionInfo;
roleList: any;
pbiReportList: string[];
categoryList: ReportCategoryListInfo[];
headerText: string;

  constructor(public activeModal: NgbActiveModal, private modalService:NgbModal) { }

  ngOnInit(): void {


    if (this.report.reportId>0)
    {
      this.headerText="Edit Report Details";
    }
    else
    {
      this.headerText="Add New Report";
    }
    
    this.roleList.forEach((role)=>{
        const currRole=this.report.roleList.find((r)=> r===role.roleId);
        if (currRole)
        {
          role["selected"]=true;
        }
        else
        {
          role["selected"]=false;
        }
    });
  }


  setReportProperties(inputReport: ReportDescriptionInfo){
    this.report={reportId: inputReport.reportId,
                 reportCategoryId:inputReport.reportCategoryId,
                  reportName: inputReport.reportName,
                  description:inputReport.description,
                  roleList:[],
                  displayOrder: inputReport.displayOrder,
                  powerBIReportName:inputReport.powerBIReportName,
                  selectedTab:inputReport.selectedTab};

      inputReport.roleList.forEach((role)=> this.report.roleList.push(role));
  }

  validName(): boolean {
   return this.report.reportName ? true: false;
  }
  validDescription(): boolean {
    return this.report.description ? true: false;
  }
  validDisplayOrder(): boolean {

    return +(this.report.displayOrder)>0 ? true : false;
  }
  formValid(): boolean {
    return this.validDescription() && this.validDisplayOrder() && this.validName();
  }

  toggleRole(roleId: number ){
    const roleIndex=this.report.roleList.findIndex(id=>id==roleId); 
    if (roleIndex>-1)
     {
       this.report.roleList.splice(roleIndex,1);
     }
     else
     {
      this.report.roleList.push(roleId);
     }
  }  
  
  isRoleSelected(roleId: number): boolean {
      const reportRole=this.report.roleList.find((id)=>{return id==roleId});
      if (reportRole)
      {
        return true;
      }
      else
      {
        return false;
      }
  }

  public closeModalAndSave() {
    if (this.formValid())
    {
      this.report.displayOrder=+(this.report.displayOrder);
      this.report.reportCategoryId=+(this.report.reportCategoryId);
      this.activeModal.close(this.report);
    }
  } 

  public closeModalWithoutSave(){
      const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
      
      modalRef.componentInstance.displayText = 'that you want to cancel your changes for this report';
  
      modalRef.result.then((result) => {
          if (result.toString() === 'yes') {
            this.activeModal.close(null);
          }
      });
    }
  }