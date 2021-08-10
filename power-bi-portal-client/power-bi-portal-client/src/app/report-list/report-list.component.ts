import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as pbi from 'powerbi-client';
import { ReportInfo } from '../models/report-info';
import { ReportServiceService } from '../report-service/report-service.service';
import { ReportCategoryListInfo, ReportDescriptionInfo } from '../models/report-list-info';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {

  selectedReport: ReportDescriptionInfo;
  displayReport: boolean = false;
  reportCategories: ReportCategoryListInfo[];
  public screenHeight: number;
  public screenWidth: number;
  public reportMarginTop: number;
  public userid: string;


  constructor(private reportService: ReportServiceService, private router: Router) {
    reportService.selectedReport$.subscribe((selectedReport: ReportDescriptionInfo) => {
      this.selectedReport = selectedReport;
    });


   reportService.displayReport$.subscribe((assignedDisplayReport: boolean) => {
        this.displayReport=assignedDisplayReport;
   });


  }

  ngOnInit() {
   this.fetchPageData();

    this.reportService.getReports().subscribe((rl) => {
      this.reportCategories = rl;
      this.reportService.reportCategories=rl;
    });

  }

  private fetchPageData(){
    this.screenHeight = (window.innerHeight);
    this.screenWidth=(window.innerWidth);
    this.reportMarginTop=20;
    this.selectedReport=null;
    this.displayReport=false;
   this.userid='c';
  }

  private getToken() {
    return '';
  }
  public onWindowResize (event)
  {
    const swbefore=this.screenWidth;
    this.screenHeight = (window.innerHeight);
    this.screenWidth=(window.innerWidth);

  }


  selectReport(report: ReportDescriptionInfo, event: any) {

    var selectedId: number=0;
    if (this.selectedReport)
    {
      selectedId=this.selectedReport.reportId;
      
    }

    //when you select a report, clear any error message from the previous selection.
    this.reportService.reportError$.next("");
    this.reportService.displayReport$.next(false);
    const element=event.currentTarget;
    var rect = element.getBoundingClientRect();
    this.reportMarginTop=rect.top-96-20;

    this.reportService.selectedReport$.next(report);
  }

  getSideNavStyle() {
    const style={ 'height': (this.screenHeight)+ 'px;' };
    if (this.displayReport)
     {
       style["width"]='0px';
     }
     else
     {
       style["width"]="294px";
     }
    return style;
  }

   public reportDivStyle() {
    
    const styleObject={ 'width': (this.screenWidth-1140) + 'px' };
    if (!this.displayReport)
     {
       styleObject['display']='none';
     }
     else
     {
       styleObject['width']="100%";
     }

    return styleObject;
     
   }

   showSelectedReport() {
     this.reportService.displayReport$.next(true);
   }

   runReport() {
     this.router.navigateByUrl('reportview');
   }


  isSelected(report:ReportDescriptionInfo): boolean {
    if(!this.selectedReport)
    {
      return false;
    }
    else
    {
      return this.selectedReport.reportId ===report.reportId;

    }
    

  }


  // If a report is selected in the menu, but not yet selected to run, show its description.
  // If there is no selected report, or the report is being displayed, do not show the description.
  showDescription(): boolean {
    if (!this.selectedReport)
    {
      return false;
    }
    if (this.displayReport)
    {
      return false;
    }

    return true;
  }

  
}
