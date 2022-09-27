import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './../../../service/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from './../../../service/error.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { MembreService } from './../../../service/membre.service';
import { WalletService } from './../../../service/wallet.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-update-event-transaction',
  templateUrl: './update-event-transaction.component.html',
  styleUrls: ['./update-event-transaction.component.scss']
})
export class UpdateEventTransactionComponent implements OnInit {

  transactionForm: FormGroup;
  currentTransaction: any;
  loading: boolean;

  constructor(
    private fb: FormBuilder,
    private wallet: WalletService,
    private member: MembreService,
    private router: Router,
    private translate: TranslateService,
    private activeModal: NgbActiveModal,
    private error: ErrorService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.wallet.getTransactionData().subscribe(data => {
      this.currentTransaction = data.transaction;
    });
    this.loading = false;
  }

  ngOnInit() {
    this.initLogin();
  }

  // Init the login Form
  initLogin() {
    this.transactionForm = this.fb.group({
      transaction_id: [this.currentTransaction.id, Validators.required],
      nouveau_montant: ['', Validators.compose([Validators.required, Validators.pattern('^[+-]?\\d+(\.\\d+)?')])]
    });
  }

  get montant() {
    return this.transactionForm.get('nouveau_montant');
  }

  // update the Amount
  updateAmount() {
    this.loading = true;
    this.spinner.show('update-transaction');
    const member = this.member.getUserSession();
    this.wallet.editPaymentMemberEvent(member.remenber_token, this.transactionForm.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.translate.get('EVENT_TRANSACTION_UPDATE_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.wallet.sendUpdateMessage('update');
        this.activeModal.dismiss();
        this.router.navigate(['/events']);
      }
      this.spinner.hide('update-transaction');
      this.loading = false;

    }, error => {

        this.activeModal.dismiss();
        this.spinner.hide('update-transaction');
        this.loading = false;
        if (error && error.error && error.error.message === 'error') {

          if (error.error.invalid_token) {
            this.translate.get('TOKEN_EXPIRED').subscribe(trans => {
              this.toast.error(trans);
            });
            this.member.logoutMember();
          }

          if (error.error.transaction_id_not_exist) {
            this.translate.get('EVENT_TRANSACTION_NOT_EXIST').subscribe(trans => {
              this.toast.error(trans);
            });
          }

        } else {
            this.error.manageError(error);
        }
    });

  }

}
