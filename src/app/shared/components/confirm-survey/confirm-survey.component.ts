import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-survey',
  templateUrl: './confirm-survey.component.html',
  styleUrls: ['./confirm-survey.component.scss']
})
export class ConfirmSurveyComponent implements OnInit {

 

  constructor(
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit() {

  }

  // Cancel message
  cancelMessage(): void {
    this.activeModal.close('cancel');
  }

  // Confirm message
  confirmMessage() {
    this.activeModal.close('confirm');
  }

}
