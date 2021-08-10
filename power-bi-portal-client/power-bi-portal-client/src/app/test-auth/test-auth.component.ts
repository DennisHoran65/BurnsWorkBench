import { Component, OnInit } from '@angular/core';
import { WorkbenchService } from '../workbench/workbench.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-auth',
  templateUrl: './test-auth.component.html',
  styleUrls: ['./test-auth.component.scss']
})
export class TestAuthComponent implements OnInit {

  form: FormGroup;
  resultText = '';
  triedLogin = false;
  constructor(private workbenchService: WorkbenchService, public fb: FormBuilder, private router: Router) {

    this.workbenchService.authenticated.subscribe((auth) => {
      if (auth) {
        this.router.navigateByUrl('manage-resources');
      } else {
        if (this.triedLogin) {
          this.resultText = 'incorrect';
        }
      }
    });

    this.form = fb.group({
      authCode: ''
    });
  }

  ngOnInit(): void {
  }

public auth(): void {
  this.triedLogin = true;
  this.workbenchService.checkAuthCode(this.form.controls.authCode.value);
}

}
