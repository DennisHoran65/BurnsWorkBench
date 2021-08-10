import { Component, OnInit } from '@angular/core';
import { ReportInfo } from '../models/report-info';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportServiceService } from '../report-service/report-service.service';
import { Router, ActivatedRoute, RouterEvent } from '@angular/router';
import { MsalService, BroadcastService } from '@azure/msal-angular';
import { Logger, CryptoUtils } from 'msal';
import { WorkbenchService } from '../workbench/workbench.service';
import { AreYouSureComponent } from '../project-resources/are-you-sure/are-you-sure.component';
import { faTintSlash } from '@fortawesome/free-solid-svg-icons';
import { throwIfEmpty } from 'rxjs/operators';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  public isNavbarCollapsed = true;
  public reports: ReportInfo[] = [];
  public selectedReportName = '';
  public selectedFeature = '';
  public selectedReportPage=null;
  public loggedIn = false;
  public userName = '';
  public projectHasChanges = false;
  public currentUrl: string=null;
  private permissions: string[]=[];
  //these are used for checking whether current URL is 
  private permissionsSet: boolean=false;
  private pagePermission: string='';
  isIframe = false;

  constructor(private reportListService: ReportServiceService,
              private workbenchService: WorkbenchService,
              private router: Router,
              private route: ActivatedRoute,
              private authService: MsalService,
              private broadcastService: BroadcastService,
              private modalService: NgbModal) {

    router.events.subscribe((routeEvent: RouterEvent) => {
      

      this.selectedReportPage=null;

      const url = routeEvent.url;
      this.currentUrl=url;
     
      if (url) {
        this.pagePermission='Entry';

        switch (url.toLowerCase().replace('/', '')) {
          case 'testing': {
            this.selectedFeature = 'TESTING';
            break;
          }
          case 'manage-resources/project': {
            this.selectedFeature = 'PROJECT ENTRY';
            break;
          }
          case 'manage-resources/obe': {
            this.selectedFeature = 'OBE ENTRY';
            break;
          }
          case 'inquiry/resource': {
            this.selectedFeature = 'RESOURCE INQUIRY';
            break;
          }
          case 'inquiry/project': {
            this.selectedFeature = 'PROJECT INQUIRY';
            break;
          }
          case 'inquiry/pm': {
            this.selectedFeature = 'PM INQUIRY';
            break;
          }
          case 'reports': {
            this.selectedFeature = 'REPORTS';
            break;
          }
          case "admin/reportlist": {
            this.selectedFeature='ADMIN';
            this.pagePermission='Admin';
            break;
          }
          default: {
            this.selectedFeature = '';
          }
        }
     }
    });

    workbenchService.ReportPageChanged$.subscribe((newPageName: string)=>{
       if (!newPageName) return;

        switch(newPageName.toLowerCase()){
           case "project manager":
            this.selectedFeature = 'PM INQUIRY';
            this.selectedReportPage='/inquiry/pm';
            break;
           case "project inquiry":
            this.selectedFeature = 'PROJECT INQUIRY';
            this.selectedReportPage='/inquiry/project';
            break;
            case "resource inquiry":
              this.selectedFeature = 'RESOURCE INQUIRY';
              this.selectedReportPage='/inquiry/resource';
              break;
            default:
              break;
        }
        
    });

    workbenchService.Permissions$.subscribe((permissionList: string[])=>{
         this.permissions=permissionList;

         this.permissionsSet=true;
         this.checkPagePermission();
    })
    workbenchService.ProjectHasChanges$.subscribe((hasChanges) => {
      this.projectHasChanges = hasChanges;
    });

   // reportListService.getReports()
   //   .subscribe((data) => {
   //     this.reports = data;
   //   });

  }

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;

    this.checkoutAccount();

    this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.checkoutAccount();
    });

    this.authService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }


    });

    this.authService.setLogger(new Logger((logLevel, message, piiEnabled) => {
 
    }, {
      correlationId: CryptoUtils.createNewGuid(),
      piiLoggingEnabled: false
    }));

  }

  public checkPagePermission(): void {


    if (!this.pagePermission || !this.permissionsSet)
    {
      return;
    }

   if(!this.hasPermission(this.pagePermission))
     {
      this.router.navigateByUrl('home');
     }
  }

  checkoutAccount() {
    this.loggedIn = !!this.authService.getAccount();
    this.workbenchService.getPermissions();
  }

  public reportSelected(report: ReportInfo) {
  }

  public hasPermission(permissionName: string):boolean {
     const permission= this.permissions.find((p)=> {return p===permissionName});
     if (permission)
     {
       return true;
     }
     else
     {
       return false;
     }
  }

  public navigateTo(newUrl: string) {
    var cancelNavigation: boolean=false;

    if (this.projectHasChanges)
    {

      const modalRef = this.modalService.open(AreYouSureComponent, { centered: true });
      modalRef.componentInstance.displayText = 'that you want to clear your changes and navigate to this report';
      modalRef.result.then((result) => {
          if (result.toString() === 'yes') {
            // do not clear the project, but no longer mark as changed.  When user navigates back to entry project will load but from db.
            this.workbenchService.ProjectHasChanges$.next(false);
            this.router.navigateByUrl(newUrl);
          } else {
           cancelNavigation=true;
          }
      });
  }
  else
  {
    //project does not have changes. Proceed.
    const currPage= this.router.url.toLowerCase();
    if (currPage.indexOf(newUrl.toLowerCase())>-1)
      {
        //if user selects the same link that we are currently on, call this
         this.redirectTo(newUrl);
      }
      else
      {
        this.router.navigateByUrl(newUrl);
      }
  } 

  }

  redirectTo(uri:string){
    if (uri)
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
 }

  public checkSelectedLinkClass(linkString: string) {
    const  activeLink=this.selectedReportPage ? this.selectedReportPage :  this.router.url.toLowerCase();
    
    if (activeLink.indexOf(linkString)>-1)
    {
      return "selected-item";
    }
    else
    {
      return "";
    }
  }

  public logmeout() {
    this.workbenchService.logMessage('user logged out');
    setTimeout(() => {
      this.authService.logout();
    }, 100);
  }
  public logmein() {

    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this.authService.loginRedirect();
    } else {
      this.authService.loginPopup();
    }
  }
}
