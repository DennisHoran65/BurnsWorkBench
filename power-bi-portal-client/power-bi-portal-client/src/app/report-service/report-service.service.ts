import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { ReportInfo } from '../models/report-info';
import { ReportCategoryListInfo, ReportDescriptionInfo } from '../models/report-list-info';
import { catchError } from 'rxjs/operators';
import { error } from 'protractor';
import { MsalService } from '@azure/msal-angular';
import { ToastrService } from 'ngx-toastr';
import { ReportSearch } from '../models/report-search';
import { environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {

  private urlRoot= environment.apiUrl + '/api/powerbi/';

  
  constructor(private http: HttpClient, private authService: MsalService,public toastr: ToastrService) {

  }

  public selectedReport$: BehaviorSubject<ReportDescriptionInfo> = new BehaviorSubject<ReportDescriptionInfo>(null);
  public displayReport$: BehaviorSubject<boolean>=new BehaviorSubject<boolean>(false);
  public reportError$:BehaviorSubject<string>=new BehaviorSubject<string>("");
  public tokenRetrieved$:BehaviorSubject<any>=new BehaviorSubject<any>(null);
  public fullReportList$:BehaviorSubject<ReportDescriptionInfo[]>=new BehaviorSubject<ReportDescriptionInfo[]>(null);
  public reportCategoryList$:BehaviorSubject<ReportCategoryListInfo[]>=new BehaviorSubject<ReportCategoryListInfo[]>(null);

  public reportCategories: ReportCategoryListInfo[];

  public userid: string="c";
  //These variables are used to save extra round trips if we are calling the same report multiple times
  public lastRetrievedToken: any=null;
  public lastRetrievedReport: string="";

  public getReports():any{
     const options = {headers: this.getHeaders(),
     method: 'POST'};
    return this.http.post<ReportCategoryListInfo[]>(this.urlRoot + 'reportlistforuser/',null,options)
    //return this.http.get<ReportCategoryListInfo[]>(this.urlRoot + 'reportlist/' + userName)
    .pipe((data) => data);
  }

  public getAllReports(searchObject: ReportSearch): any {
   // const options = {headers: this.getHeaders(),
   //   method: 'POST'};
    this.http.post<ReportDescriptionInfo[]>(this.urlRoot + 'fullreportList',searchObject)
    .pipe((data) => data)
    .toPromise().then((rl) => {
      this.fullReportList$.next(rl);
    });
  }

  public getAllReportCategories():any {
     this.http.get<ReportCategoryListInfo[]>(this.urlRoot + 'categories')
    .pipe((data) => data)
    .toPromise().then((rl) => {
      this.reportCategoryList$.next(rl);
    });
  }

  public getAllRoles():any {
    return this.http.get<ReportCategoryListInfo[]>(this.urlRoot + 'roles')
    .pipe((data) => data);
  }

  public getAllPowerBIReportNames():any {
    return this.http.get<string[]>(this.urlRoot + 'pbireportlist')
    .pipe((data) => data);
  }

  public selectReport(report: ReportDescriptionInfo) {
    this.selectedReport$.next(report);
  }

  public saveReport(report: ReportDescriptionInfo, searchObject: ReportSearch): any {
    const options = {headers: this.getHeaders(),
                    method: 'POST'};
    
    this.http.post<boolean>(this.urlRoot + 'saveReport', report, options).subscribe((result) => {
      if (result) {
        this.toastr.success('Report defintion saved');
       this.getAllReports(searchObject);
      }
    },
    (error)=>{
              this.toastError("Unable to save report", "Error Saving report");
             }
    );
  }

  
  public deleteReport(report: ReportDescriptionInfo, searchObject: ReportSearch):any {
    const options = {headers: this.getHeaders(),
                    method: 'POST'};
    
    this.http.post<boolean>(this.urlRoot + 'deleteReport', report, options).subscribe((result) => {
      if (result) {
        this.toastr.success('Report has been deleted');
        this.getAllReports(searchObject);
      }
    },
    (error)=>{
              this.toastError("Unable to delete report", "Error Deleting report");
              console.log(error);
             }
    );
  }

  public saveCategory(category: ReportCategoryListInfo): any {
    const options = {headers: this.getHeaders(),
                    method: 'POST'};
    
    this.http.post<boolean>(this.urlRoot + 'saveCategory', category, options).subscribe((result) => {
      if (result) {
        this.toastr.success('Category saved');
       this.getAllReportCategories();
      }
    },
    (error)=>{
              this.toastError("Unable to save category", "Error saving");
             }
    );
  }

  public toastError(msg: string, headerText: string)
  {
  const toastErrorConfig = {closeButton: true, timeOut: 0, extendedTimeOut: 0,enableHtml: true};
  const buttonText="<br /><center><font color=\"blue\"><b><u>OK</u></b></font></center>";

  this.toastr.error(msg + buttonText, headerText, toastErrorConfig);
  }

  public deletCategory(category: ReportCategoryListInfo):any {
    const options = {headers: this.getHeaders(),
                    method: 'POST'};
    
    this.http.post<boolean>(this.urlRoot + 'deleteCategory', category, options).subscribe((result) => {
      if (result) {
        this.toastr.success('Category has been deleted');
        this.getAllReportCategories();
      }
    },
    (error)=>{
             this.toastError("Error removing category.  Check if category has any current reports","Error Deleting");
             }
    );
  }


  public getHeaders(): HttpHeaders {

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('userName',  this.authService.getAccount().userName);
    headers = headers.append('groupids', this.authService.getAccount().idTokenClaims.groups);
    return headers;

  }

  public  getReportObject(reportId: number): ReportDescriptionInfo
  {
     this.reportCategories.forEach((cat:ReportCategoryListInfo)=>
      {
        const report :ReportDescriptionInfo=cat.reports.find((r)=>{r.reportId===reportId});
        if (report)
        {
          return report;
        }
      }
     )
     return null;
  }


  public getReportToken(reportName: string):any {



    this.http.get<any>(this.urlRoot + 'pbitoken/' + reportName)
    .pipe((data) => data)
    .toPromise()
    .then((token: any) => {
          this.lastRetrievedReport=reportName;
          this.lastRetrievedToken=token;
          this.tokenRetrieved$.next(token);
    },
    (error: any) => {
         this.reportError$.next("There was an error retrieiving your report.");
    });

  }

  private handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
        // client-side error
        errorMessage = `Error: ${error.error.message}`;
    } else {
        // server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
}

}
