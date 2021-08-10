import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

@Injectable()

  export class AddUserNameToHeadersInterceptor implements HttpInterceptor {

    constructor(private msalService: MsalService) {}

    intercept( req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (req.body) {
        const duplicate = req.clone({
            setHeaders: { UserName: this.msalService.getAccount().userName}
        });
        return next.handle(duplicate);
      }
      return next.handle(req);
    }
}
 