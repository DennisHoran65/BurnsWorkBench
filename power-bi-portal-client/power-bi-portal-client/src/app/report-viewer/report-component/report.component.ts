import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import * as pbi from 'powerbi-client';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { ActivatedRoute } from '@angular/router';
import { UIProjectEmployeeModel } from '../../workbench/models/ui-models/ui-project-employee';
import { ProjectApiModel } from '../../workbench/models/api-models/project-api-model';
import { ProjectManager } from '../../workbench/models/api-models/project-manager';
import { ReportServiceService } from 'src/app/report-service/report-service.service';
import { ReportDescriptionInfo } from 'src/app/models/report-list-info';
declare var powerbi: any;

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
 @ViewChild('embeddedReport')
 embeddedReport: ElementRef;
 config: any;
 screenHeight:number;
 screenWidth:number;
 reportPages:any;
 inquiryType: string;
 report: any;

 //These are used to select the current project/resource/pm inside a report
 selectedResource:UIProjectEmployeeModel;
 selectedProject: ProjectApiModel;
 selectedProjectManager: ProjectManager;

 loadReport: boolean;
 selectedReportName: string;
 selectedReport: ReportDescriptionInfo;
 errorMessage: string;

 loading: boolean;

  constructor(private workbenchService: WorkbenchService, private reportService: ReportServiceService,  private route: ActivatedRoute){


    reportService.selectedReport$.subscribe((report: ReportDescriptionInfo)=>{
           this.selectedReport=report;
           this.loading=true;
           const reportName=this.selectedReport.powerBIReportName;
            reportService.getReportToken(reportName);

    });

    reportService.reportError$.subscribe((errorMessage: string)=>{
      this.errorMessage=errorMessage;
    });

    reportService.tokenRetrieved$.subscribe((newToken: any)=> {
         
         this.config=newToken;
         this.errorMessage="";
         this.loading=true;
         this.setWidthAndHeight();
         if (newToken)
         {
            this.showReport();
         }
    });


   }

  ngOnInit() {

  // document.getElementById("reportDiv").style.display="none";
  //  document.getElementById("loadingDiv").style.display="inline";
    this.screenHeight = (window.innerHeight);  
    this.screenWidth= (window.innerWidth);

  
  }

  public reportDisplayStyle(){
    const style={ 'height': (this.screenHeight-106)+ 'px' };
    const hideReport=(!this.loadReport) || (this.errorMessage) || (this.loading);
    
    if (hideReport)
     {
       style['display']='none';
     }

     return style;
  }



  private showReport(){
    
   // powerbi.reset(this.embeddedReport.nativeElement);
    const filter = this.getFilter();


  let slicerState=null;
  if (filter.length>0)
  {
   slicerState = [
    {
      selector: {
        $schema: "http://powerbi.com/product/schema#slicerTargetSelector",
        target: filter[0].target 
      },
      state: {
        filters: [
          {
            "$schema":"http://powerbi.com/product/schema#advanced",
            "target":filter[0].target,
            "filterType":0,
            "logicalOperator":"And",
            "conditions":[{"operator":"Equal","value":filter[0].values[0]}]
          }
        ]
      }
    }
  ];
}
 

    //const reportPageName=this.inquiryType==='resource' ? 'Resource Inquiry' : this.inquiryType==='project' ? 'Project Inquiry' : 'Project Manager';
    const reportPageName=this.selectedReport.selectedTab;
    const reportName=this.selectedReport.powerBIReportName;


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
          navContentPaneEnabled: true
        }
      };
    
      
      var reportElement=document.getElementById("reportDiv");
      this.report = powerbi.embed(reportElement, embedConfig);
      //var report = powerbi.embed(this.embeddedReport.nativeElement, embedConfig);
      // this.loading=false;

      this.report.on('rendered', ()=>{this.loading=false;});
  
      this.report.on('loaded',
               (event)=> { 
                    
                     

                    // this.loading=false;

                     this.report.getPages()
                        .then(function (reportPages) {
                          
                          if (reportPages)
                          {
                          const selectedPage= reportPages.find((p)=>{return p.displayName==reportPageName});
                          if (!selectedPage)
                          {
                            return;
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
                              console.log("NO selected page");
                              //document.getElementById("reportDiv").style.display="inline";
                              //document.getElementById("loadingDiv").style.display="block";
                            }
                          }
                        }); 

                this.report.off('loaded');
                }); 

  }



  private getFilter():any {

    let tableName: string='';
    let columnName: string='';
    let value: string='';
    let hasFilter: boolean=true;

    switch(this.inquiryType)
    {
      case 'resource':
        if (this.selectedResource!=null)
        {
           tableName="Resource";
           columnName="FullName";
           value=this.selectedResource.Name;
        }
        else
        {
          hasFilter=false;
        }
        break;
      case 'project':
        if (this.selectedProject !=null)
        {
          tableName="dim Project";
          columnName="ProjectNumberName";
           value=this.selectedProject.projectDetail.projectNumber + ' / '
                + this.selectedProject.projectDetail.projectName;
        }
        else
        {
          hasFilter=false;
        }
        break;
      case 'pm':
      if (this.selectedProjectManager !=null)
        {
           tableName="dim ProjectManager";
           columnName="PMFullName";
           value=this.selectedProjectManager.name;
        }
        else
        {
          hasFilter=false;
        }
        break;
    }

    if (hasFilter)
    {
      const filterObject=
      {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: tableName,
            column:columnName
        },
        operator: "In",
        values: [value],
        filterType: 1,
        requireSingleSelection: true
    }
         return [filterObject];
    }
    else
    {
      return [];
    }

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
