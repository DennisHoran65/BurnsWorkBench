import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import * as pbi from 'powerbi-client';
import { WorkbenchService } from 'src/app/workbench/workbench.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UIProjectEmployeeModel } from '../workbench/models/ui-models/ui-project-employee';
import { ProjectApiModel } from '../workbench/models/api-models/project-api-model';
import { ProjectManager } from '../workbench/models/api-models/project-manager';
import { ReportServiceService } from '../report-service/report-service.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Z_FILTERED } from 'zlib';
import { ProjectInfo } from '../workbench/models/api-models/project-increment';
declare var powerbi: any;

@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss']
})
export class InquiryComponent implements OnInit {
 @ViewChild('embeddedInquiryReport')
 embeddedReport: ElementRef;
 config: any;
 screenHeight:number;
 reportPages:any;
 inquiryType: string;
 selectedResource:UIProjectEmployeeModel;
 selectedProject: ProjectApiModel;
 selectedProjectManager: ProjectManager;
 loading: boolean;
 report: any;
 public topLevelProjectList: ProjectInfo[];

  constructor(private workbenchService: WorkbenchService, private reportService: ReportServiceService, private route: ActivatedRoute, private router: Router){

    this.router.routeReuseStrategy.shouldReuseRoute=()=> {
         return false;
    };

    workbenchService.SelectedEmployee$.subscribe((resource) => {
      this.selectedResource = resource;
    });

    workbenchService.SelectedProject$.subscribe((project)=>{
      this.selectedProject=project;
    });

    this.workbenchService.TopLevelProject$.subscribe((topLevelProjects)=> {
      this.topLevelProjectList=topLevelProjects;
    });


    workbenchService.SelectedProjectManager$.subscribe((pm)=>{
      this.selectedProjectManager=pm;
    });

    reportService.tokenRetrieved$.subscribe((newToken: any)=> {
         
       this.config=newToken;
       this.loading=true;
       if (newToken && this.inquiryType)
       {
        setTimeout(()=> {this.showReport()},1000);
       }
  });



   }

  ngOnInit() {
    this.loading=true;
    this.report=null;

    
    this.screenHeight = (window.innerHeight);  

   // this.reportService.selectReport(null);
    this.reportService.tokenRetrieved$.next(null);
    
    this.route.params.subscribe((params)=>{
       this.inquiryType=params['inquiryType'];
       this.reportService.getReportToken("inquiry");
      } );

  
  }

  private showReport(){
    this.loading=true;
    const filter = this.getFilter();

  let slicerState=null;

 
    const reportPageName=this.inquiryType==='resource' ? 'Resource Inquiry' : this.inquiryType==='project' ? 'Project Inquiry' : 'Project Manager';

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


      const filters=this.getFilter();

      this.report.on('loaded',
               ()=> { 

                    this.report.getPages()
                        .then( (reportPages)=> {
                          if (reportPages)
                          {
                          const selectedPage= reportPages.find((p)=>{return p.displayName==reportPageName});
                            if (selectedPage)
                            {
                            selectedPage.setActive();
                            // selectedPage.setFilters(filter);
                             
                             if (slicerState || true)
                             {
                             selectedPage.getVisuals()
                                 .then((visuals)=> {
                                   const slicers=visuals.filter((visual)=>{return visual.type==="slicer" });

                                   slicers.forEach(slicer => {

                                         const slicerState=this.getSlicerState(slicer.title);

                                         if (slicerState)
                                         {
                                           slicer.setSlicerState(slicerState);
                                         } 
                                       
                                         const slicerTotalCount=slicers.length;
                                          let slicerSetCount=0;
                                        
                                        }); //slicers foreach

                                       
                                 }); //getVisuals
                               }
                              
                            }
                            else
                            {
                              console.log("NO selected page");
                              
                            }
                          }
                        });
                });
       
        this.report.on('pageChanged',
        (newPage)=> {
                this.workbenchService.changeReportPage(newPage.detail.newPage.displayName);

      });

  }

  private getFilter():any {

    let tableName: string='';
    let columnName: string='';
    let columnName2: string='';
    let value: string='';
    let value2: string='';
    let hasFilter: boolean=true;
    let title: string='';
    let title2: string=''
    let filterObject1=null;
    let filterObject2=null;
    const filterResult=[];

    switch(this.inquiryType)
    {
      case 'resource':
        if (this.selectedResource!=null)
        {
          title="Resource";
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
          title="Project Number";
          title2="Task";
          tableName="dim Project";
          columnName="ParentProjectNumberName";
          columnName2="TaskNumberName";
           value=this.selectedProject.projectDetail.projectNumber + ' / '
                + this.getTopLevelProjectName(this.selectedProject.projectDetail.projectNumber);
           value2=this.selectedProject.projectDetail.projectTask + ' / ' + this.selectedProject.projectDetail.projectName;
        }
        else
        {
          hasFilter=false;
        }
        break;
      case 'pm':
      if (this.selectedProjectManager !=null)
        {
          title="Project Manager";
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
      filterObject1=
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

   if (columnName2)
     filterObject2=
      {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: tableName,
            column:columnName2
        },
        operator: "In",
        values: [value2],
        filterType: 1,
        requireSingleSelection: true
    }

         if (filterObject1)
         {
           filterResult.push({title: title, filterObject: filterObject1});
         }
         if (filterObject2)
         {
           filterResult.push({title: title2, filterObject: filterObject2});
         }

         return filterResult;
    }
    else
    {
      return [];
    }

  }

  private getTopLevelProjectName(projectNumber: string): string{
      const topLevelProject:ProjectInfo = this.topLevelProjectList.find((p)=>{return p.projectNumber===projectNumber});
      if (topLevelProject)
      {
        return topLevelProject.projectName;
      }
      else
      {
        return "";
      }
  }


  private getSlicerState(title: string): any {


   const filters=this.getFilter();

   let selectedFilter=null;
   if (filters.length==1)
   {
     selectedFilter=filters[0];
   }
   else
   {
     selectedFilter=filters.find((f)=>{return f.title.toLowerCase()===title.toLowerCase()});

   }


  if (selectedFilter)
  {
  const returnState= {
          filters: [
            selectedFilter.filterObject
          ],
          targets: [selectedFilter.filterObject.target]
        };

    return returnState;
    }
    else
    {
      return null;
    }

  }

  public onWindowResize(evt:any){
    this.screenHeight = (window.innerHeight); 
  }

}
