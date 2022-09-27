import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-message',
  templateUrl: './confirm-message.component.html',
  styleUrls: ['./confirm-message.component.scss']
})
export class ConfirmMessageComponent implements OnInit {

 

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
