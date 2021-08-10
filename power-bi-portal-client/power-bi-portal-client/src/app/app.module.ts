import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { HomeComponent } from './home/home.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminReportsComponent } from './admin/admin-reports/admin-reports.component';
import { ProjectResourcesComponent } from './project-resources/main-page/project-resources.component';
import { HttpClientModule } from '@angular/common/http';
import { ProjectInfoComponent } from './project-resources/project-info/project-info.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule, NgbActiveModal, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FooterComponent } from './footer/footer.component';
import { DisciplinesComponent } from './project-resources/disciplines/disciplines.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditProjectDateComponent } from './project-resources/edit-project-date/edit-project-date.component';
import { ResourcesComponent } from './project-resources/resources/resources.component';
import { ScheduleComponent } from './project-resources/schedule/schedule.component';
import { DatePipe } from '@angular/common';
import { DisplayNumber, DisplayCurrency, DisplayText } from './project-resources/custom-format-pipes';
import { NgbDateCustomParserFormatter } from './project-resources/ngbDateFormat';
import { AreYouSureComponent } from './project-resources/are-you-sure/are-you-sure.component';
import { TestAuthComponent } from './test-auth/test-auth.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { OnlyNumber } from './directives/number-only';
import { InquiryComponent } from './inquiry/inquiry.component';
import { ReportComponent} from './report-viewer/report-component/report.component';
import {
  MsalModule,
  MsalInterceptor,
  MSAL_CONFIG,
  MSAL_CONFIG_ANGULAR,
  MsalService,
  MsalAngularConfiguration
} from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Configuration } from 'msal';
import { DateChangeNotifyComponent } from './project-resources/date-change-notify/date-change-notify.component';
import { AddScheduleWeeksComponent } from './project-resources/add-schedule-weeks-modal/add-schedule-weeks-modal.component';
import { ResourceEditModalComponent } from './project-resources/resource-edit-modal/resource-edit-modal.component';
import { AddUserNameToHeadersInterceptor } from './AddUserNameToHeadersInterceptor';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportEditModalComponent } from './admin/report-edit-modal/report-edit-modal.component';
import { AdminReportCategoryComponent } from './admin/admin-report-category/admin-report-category.component';
import { environment} from "src/environments/environment";

export const protectedResourceMap: [string, string[]][] = [
  ['https://graph.microsoft.com/v1.0/me',['user.read']]
];


const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

function MSALConfigFactory(): Configuration {
  return {
    auth: {
      clientId: '2059526e-82bc-43ca-80f0-f5312218c5c7',
      // authority: "https://login.microsoftonline.com/common/",
       authority: 'https://login.microsoftonline.com/88860df0-6bfa-4518-8458-a9a02a479128', // This is your tenant ID
      validateAuthority: true,

      
     //  redirectUri: 'https://glonlyworkbench.z22.web.core.windows.net/',
     // postLogoutRedirectUri: 'https://glonlyworkbench.z22.web.core.windows.net/',

      // redirectUri: 'https://authburnswb.z22.web.core.windows.net/',
     //  postLogoutRedirectUri: 'https://authburnswb.z22.web.core.windows.net',
     
      redirectUri: environment.redirectUri,
      postLogoutRedirectUri: environment.postLogoutRedirectUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: isIE, // set to true for IE 11
    },
  };
}

function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return {
    popUp: !isIE,
    consentScopes: [
      'user.read.all',
      'directory.read.all',
      'groups.read.all',
      'openid',
      'profile',
      'api://88860df0-6bfa-4518-8458-a9a02a479128/access_as_user',
      'api://a88bb933-319c-41b5-9f04-eff36d985612/access_as_user'
    ],
    unprotectedResources: ['https://www.microsoft.com/en-us/'],
    protectedResourceMap,
    extraQueryParameters: {}
  };
}

@NgModule({
  declarations: [
    AppComponent,
    ReportViewerComponent,
    TopMenuComponent,
    HomeComponent,
    AdminUsersComponent,
    AdminReportsComponent,
    ProjectResourcesComponent,
    ProjectInfoComponent,
    NavBarComponent,
    FooterComponent,
    DisciplinesComponent,
    EditProjectDateComponent,
    ResourcesComponent,
    ScheduleComponent,
    DisplayNumber,
    DisplayCurrency,
    DisplayText,
    AreYouSureComponent,
    TestAuthComponent,
    OnlyNumber,
    InquiryComponent,
    DateChangeNotifyComponent,
    ResourceEditModalComponent,
    AddScheduleWeeksComponent,
    ReportComponent,
    ReportListComponent,
    ReportEditModalComponent,
    AdminReportCategoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    FontAwesomeModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), // ToastrModule added
    MsalModule
  ],
  providers: [ NgbActiveModal, DatePipe, 
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AddUserNameToHeadersInterceptor,
      multi: true
    },
    MsalService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
