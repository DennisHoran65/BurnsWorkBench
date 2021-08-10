import { MsalService, BroadcastService } from '@azure/msal-angular';
import { Component, OnInit } from '@angular/core';
import { Logger, CryptoUtils } from 'msal';
import { WorkbenchService } from './workbench/workbench.service';
import { ReportServiceService} from './report-service/report-service.service';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Burns Workbench';
  isIframe = false;
  loggedIn = false;
  permissionCount: number=0;

  constructor(private broadcastService: BroadcastService, private authService: MsalService, 
              private workBenchService: WorkbenchService,
              private reportService: ReportServiceService) { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;

    this.checkoutAccount();

    this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.checkoutAccount();
    });

    this.workBenchService.Permissions$.subscribe((permissions:string[])=>{
      this.permissionCount=permissions.length;
    });

    this.authService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }

      console.log('Redirect Success: ', response);
    });

    this.authService.setLogger(new Logger((logLevel, message, piiEnabled) => {
      console.log('MSAL Logging: ', message);
    }, {
      correlationId: CryptoUtils.createNewGuid(),
      piiLoggingEnabled: false
    }));
  }

  checkoutAccount() {
    //if this.loggedIn is going from false to true, we should load permissions to see if user has access.
    this.loggedIn = !!this.authService.getAccount();

  }

  public nonPermissionedUser(): boolean {
    if (this.loggedIn && this.permissionCount===0)
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  login() {
    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this.authService.loginRedirect();
    } else {
      this.authService.loginPopup().then((x) => {
        this.workBenchService.logMessage('user logged in');
      });
    }
  }

  logout() {
    this.workBenchService.logMessage('user logged out');
    setTimeout(() => {
      this.authService.logout();
    }, 3000);
  }
}
