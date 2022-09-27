import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-confirm-logout',
  templateUrl: './confirm-logout.component.html',
  styleUrls: ['./confirm-logout.component.scss']
})
export class ConfirmLogoutComponent implements OnInit, OnDestroy {
  loading: boolean;
  timer: any;

  constructor(
    public activeModal: NgbActiveModal
  ) {
      this.loading = false;
   }

  ngOnInit() {
    this.logoutSystem();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  // cancel the payment
  cancelLogout(): void {
    if (this.timer) {
        clearTimeout(this.timer);
    }
    this.activeModal.close('cancel');
  }

  confirmLogout() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.activeModal.close('logout');
  }

  logoutSystem() {
    this.timer = setTimeout(() => {
      this.cancelLogout();
    }, 30000);
  }

}
