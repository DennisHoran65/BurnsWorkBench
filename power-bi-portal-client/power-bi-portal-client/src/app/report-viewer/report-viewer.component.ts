import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import * as pbi from 'powerbi-client';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UIProjectEmployeeModel } from '../workbench/models/ui-models/ui-project-employee';
import { ProjectApiModel } from '../workbench/models/api-models/project-api-model';
import { ProjectManager } from '../workbench/models/api-models/project-manager';
import { ReportServiceService } from 'src/app/report-service/report-service.service';
import { ReportDescriptionInfo } from 'src/app/models/report-list-info';
declare var powerbi: any;

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {
  @ViewChild('embeddedReport')
  embeddedReport: ElementRef;
  config: any;
  screenHeight:number;
  screenWidth:number;
  reportPages:any;
  reportObject: ReportDescriptionInfo
  report: any;  //this is the powerbe report
 
  //These are used to select the current project/resource/pm inside a report
  selectedResource:UIProjectEmployeeModel;
  selectedProject: ProjectApiModel;
  selectedProjectManager: ProjectManager;
 
  loadReport: boolean;
  selectedReportName: string;
  selectedReport: ReportDescriptionInfo;
  errorMessage: string;
 
  loading: boolean;
  loadStarted: boolean=false; //check if load happens multiple times
 
   constructor(private workbenchService: WorkbenchService, private reportService: ReportServiceService,  private router: Router){
 
 
     reportService.selectedReport$.subscribe((report: ReportDescriptionInfo)=>{
          if (report)
          {
            this.selectedReport=report;
           
          }
 
     });
 
     reportService.reportError$.subscribe((errorMessage: string)=>{
       this.errorMessage=errorMessage;
     });
 
     reportService.tokenRetrieved$.subscribe((newToken: any)=> {
          
         if (!this.loadStarted)
         {
          this.config=newToken;
          this.errorMessage="";
          this.loading=true;
          this.setWidthAndHeight();
          if (newToken)
          {
              setTimeout(()=>{this.showReport();},500);
          }
        }
     });
 
 
    }
 
   ngOnInit() {
 
   // document.getElementById("reportDiv").style.display="none";
   //  document.getElementById("loadingDiv").style.display="inline";
     this.screenHeight = (window.innerHeight);  
     this.screenWidth= (window.innerWidth);
     if (this.selectedReport)
     {
      this.reportService.getReportToken(this.selectedReport.powerBIReportName);
     }
     else
     {
      this.router.navigateByUrl('reports');
     }

   }
 
   public reportDisplayStyle(){
     const style={ 'height': (this.screenHeight-120)+ 'px' };
     const hideReport=(this.errorMessage) || (this.loading);
     
     
     if (hideReport)
      {
        style['display']='none';
      }
      
      return style;
      
   }
 
 
 
   private showReport(){
     
    this.loadStarted=true;
    // powerbi.reset(this.embeddedReport.nativeElement);
     const filter = null;
 
   let slicerState=null;
   
 
     const reportPageName=this.selectedReport.selectedTab;
 
       const model=pbi.models;
       //const model = window['powerbi-client'].models;
 
       const embedConfig = {
         type: 'report',
         tokenType: model.TokenType.Embed,
         accessToken: this.config.token,
         embedUrl: this.config.embedUrl,
         pageName: reportPageName,
         filters: [],
         permissions: model.Permissions.All,
         settings: {
           filterPaneEnabled: false,
           navContentPaneEnabled: false
         }
       };
       

       
       var reportElement=document.getElementById("reportDiv");
       this.report = powerbi.embed(reportElement, embedConfig);
       //var report = powerbi.embed(this.embeddedReport.nativeElement, embedConfig);
        this.loading=false;

 
       this.report.on('rendered', ()=>{
        this.loading=false;});
   
       this.report.on('loaded',
                (event)=> { 
                    
                      
                       this.loading=false;
                    
                      this.report.getPages()
                         .then(function (reportPages) {
                           
                           if (reportPages)
                           {
                           const selectedPage= reportPages.find((p)=>{return p.displayName==reportPageName});
                           if (!selectedPage)
                           {
                             console.log("...The Selected page was not found");
                           }
                             if (selectedPage)
                             {
                               selectedPage.report["logMessage"]="Does this work?";
                             selectedPage.setActive();
                             // selectedPage.setFilters(filter);
                              selectedPage.report["logMessage"]="Does this work?";
                              if (slicerState)
                              {
                              selectedPage.getVisuals()
                                  .then(function(visuals) {
                                    const slicers=visuals.filter((visual)=>{return visual.type==="slicer" });
                                    slicers.forEach(slicer => {
                                           const slicerTotalCount=slicers.length;
                                           let slicerSetCount=0;
                                           slicer.getSlicerState()
                                           .then(state=>{
                                                   if (state.targets[0].table===filter[0].target.table)
                                                   {
                                                     state.filters=filter;
                                                     slicer.setSlicerState(state);
                                                     slicerSetCount++;
                                                   }
                                                   else
                                                   {
                                                     state.filters=[];
                                                     slicer.setSlicerState(state);
                                                     slicerSetCount++;
                                                   }
                                                 
                                                   if (slicerSetCount===slicerTotalCount)
                                                   {
                                                     //document.getElementById("reportDiv").style.display="block";
                                                    //document.getElementById("loadingDiv").style.display="none";
                                                   }
 
                                                 }); //slicer.getSlicerState()
                                         }); //slicers foreach
 
                                        
                                  }); //getVisuals
                                }
                                else
                                {
                                 //document.getElementById("reportDiv").style.display="block";
                                 //document.getElementById("loadingDiv").style.display="none";
                                }
                             }
                             else
                             {
                               //document.getElementById("reportDiv").style.display="inline";
                               //document.getElementById("loadingDiv").style.display="block";
                             }
                           }
                         }); 
 
                 this.report.off('loaded');
                 }); 
 
   }
 
  
 
  
 
   public onWindowResize(evt:any){
     
     this.setWidthAndHeight();
 
   }
 
   public setWidthAndHeight()
   {
     this.screenHeight = (window.innerHeight); 
     this.screenWidth=(window.innerWidth);
   }
 
 }
 