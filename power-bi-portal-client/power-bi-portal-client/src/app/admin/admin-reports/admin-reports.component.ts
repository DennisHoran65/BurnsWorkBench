import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReportCategoryListInfo, ReportDescriptionInfo } from 'src/app/models/report-list-info';
import {ReportSearch} from 'src/app/models/report-search';
import { AreYouSureComponent } from 'src/app/project-resources/are-you-sure/are-you-sure.component';
import { ReportServiceService } from 'src/app/report-service/report-service.service';
import { AdminReportCategoryComponent } from '../admin-report-category/admin-report-category.component';
import { ReportEditModalComponent } from '../report-edit-modal/report-edit-modal.component';
import { environment} from 'src/environments/environment';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.scss']
})
export class AdminReportsComponent implements OnInit {
  reportList:ReportDescriptionInfo[];
  categoryList: ReportCategoryListInfo[];
  roleList: any;
  pbiReportList: string[];
  search: ReportSearch;
  environmentName: string;


  constructor(private reportService: ReportServiceService, private modalService: NgbModal, public toastr: ToastrService ) {
     
   reportService.fullReportList$.subscribe((rl)=>{
       this.reportList=rl;
   });

   reportService.reportCategoryList$.subscribe((cl)=>{
       this.categoryList=cl;
   });

  }

  ngOnInit(): void {

    this.environmentName=environment.environmentName;

    this.search={categoryName: "",
                 powerBIName: "",
                 reportName: "",
                 roleList: "",
                 sortField: "reportname"
                };

    this.updateSearch();

    this.reportService.getAllReportCategories();


    this.reportService.getAllRoles().subscribe((rl)=>{
         this.roleList=rl;
    });

    this.reportService.getAllPowerBIReportNames().subscribe((pbiList)=>{
         this.pbiReportList=pbiList;
    });
  }

  updateSort(sortField: string) {
    this.search.sortField=sortField;
    this.updateSearch();
  }

  updateSearch() {
    this.reportService.getAllReports(this.search);
  }

   editReport(report: any){
      this.editReportModal(report);
  }

  addReport() {
    let newReport: ReportDescriptionInfo=new ReportDescriptionInfo();
    newReport.reportId=0;
    newReport.roleList=[];
    this.editReportModal(newReport);
  }


  private editReportModal(report: ReportDescriptionInfo) {
    const modalRef = this.modalService.open(ReportEditModalComponent, { centered: true, windowClass: 'boo', backdropClass: 'bd' });
    modalRef.componentInstance.setReportProperties(report);
    modalRef.componentInstance.roleList=this.roleList;
    modalRef.componentInstance.pbiReportList=this.pbiReportList;
    modalRef.componentInstance.categoryList=this.categoryList;
    modalRef.result.then((result: ReportDescriptionInfo) =>{
      if (result)
       {
         this.reportService.saveReport(result, this.search);
         //this.reportService.saveReport(result,this.search).then((rl)=>{this.reportService=rl;}
         //) ;
         //setTimeout(()=>{this.updateSearch()}, 1000);
       }
    });

  }

  public deleteReport(report: ReportDescriptionInfo) {
    const modalRef = this.modalService.open(AreYouSureComponent, { centered: true});
    modalRef.componentInstance.displayText="you want to permanently remove this report from the database list?";
    modalRef.result.then((result)=>{
         if (result==="yes")
         {
          this.reportService.deleteReport(report, this.search);
          //this.reportService.deleteReport(report, this.search).then((rl)=>{this.reportService=rl;}
          //) ;
          //setTimeout(()=>{this.updateSearch()}, 1000);
         }

    });

   
  }

  public openCategoryList()
  {
    this.modalService.open(AdminReportCategoryComponent, {centered: true});
  }


}
