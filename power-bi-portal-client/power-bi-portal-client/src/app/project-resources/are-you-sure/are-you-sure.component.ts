import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-are-you-sure',
  templateUrl: './are-you-sure.component.html',
  styleUrls: ['./are-you-sure.component.scss']
})
export class AreYouSureComponent implements OnInit {

  public displayText: string;
  public errors: string[] = [];
  public title = 'Confirm';
  
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
  }
}
