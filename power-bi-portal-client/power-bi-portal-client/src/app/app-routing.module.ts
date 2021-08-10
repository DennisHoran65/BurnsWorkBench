import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import {ReportListComponent} from './report-list/report-list.component';
import {AdminReportsComponent} from '../app/admin/admin-reports/admin-reports.component';
import { ProjectResourcesComponent } from './project-resources/main-page/project-resources.component';
import { TestAuthComponent } from './test-auth/test-auth.component';
import { InquiryComponent } from './inquiry/inquiry.component';
import { MsalGuard } from '@azure/msal-angular';


const routes: Routes = [
  { path: 'manage-resources/:projectType', component: ProjectResourcesComponent, canActivate: [MsalGuard]  },
  { path: 'inquiry/:inquiryType', component: InquiryComponent, canActivate: [MsalGuard]  },
  { path: 'reports', component: ReportListComponent },
  { path: 'reportview', component: ReportViewerComponent },
  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: 'admin/reportlist', component: AdminReportsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {


 }
