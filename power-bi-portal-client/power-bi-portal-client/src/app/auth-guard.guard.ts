import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WorkbenchService } from './workbench/workbench.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {
  constructor(public workBenchService: WorkbenchService, private router: Router) {

  }
  canActivate() {

    let authenticated = false;

    if (this.workBenchService) {
      authenticated = this.workBenchService.authenticated.value;
    }

    if(authenticated) {
      return true;
    } else {
      this.router.navigateByUrl('/testing');
      return false;
    }
  }
}
