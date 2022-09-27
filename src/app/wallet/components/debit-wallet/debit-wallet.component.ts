import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { slideInLeft } from 'src/app/animations';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { WalletService } from 'src/app/service/wallet.service';

@Component({
  selector: 'app-debit-wallet',
  templateUrl: './debit-wallet.component.html',
  styleUrls: ['./debit-wallet.component.scss'],
  animations:[
    slideInLeft
  ]
})
export class DebitWalletComponent implements OnInit {

  formData: FormGroup;
  loadingShow: boolean;
  token: string;
  currentData: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private member: MembreService,
    private translate: TranslateService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbActiveModal,
    private wallet: WalletService
  ) {
      this.loadingShow = false;
      this.currentData = this.wallet.getMemberData();
    
  }

  ngOnInit() {
    this.initFormData();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormData() {
      this.formData = this.fb.group({
        member_id: [ this.currentData && this.currentData.infos_membre ? this.currentData.infos_membre.member_id : ''],
        amount: ['', Validators.compose([Validators.required, Validators.max(this.currentData.solde), Validators.pattern('^[+-]?\\d+(\.\\d+)?')])]
      });
  }

    // debit rpn family wallet
    debitWallet() {
      this.loadingShow = true;
      this.spinner.show('form-action');
      this.wallet.debitMemberWallet(this.token, this.formData.value).subscribe(reponse => {
        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('WALLET_DEBIT_MESSAGE').subscribe(trans => {
            this.toast.success(trans);
          });
          this.initFormData();
          this.wallet.sendUpdateMessage('update');
          this.modalService.dismiss();
        }
        this.spinner.hide('form-action');

      }, error => {
        this.modalService.dismiss();
        this.loadingShow = false;
        this.spinner.hide('form-action');
        if (error && error.error && error.error.message === 'error') {
          if (error.error.invalid_token) {
            this.member.logoutMember();
          }
          if (error.error.remplir_tous_les_champs) {
            this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
              this.toast.error(trans);
            });
          }
          if (error.error.member_id_not_exist) {
            this.translate.get('EVENT_PARTICIPATION_MEMBER_NOT_EXIST').subscribe(trans => {
              this.toast.error(`${trans}`);
            });
          }
        } else {
          this.error.manageError(error);
        }
      });
    }

}
