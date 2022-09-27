import { ApiService } from './../../../service/api.service';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from './../../../service/wallet.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-credit-member-wallet',
  templateUrl: './credit-member-wallet.component.html',
  styleUrls: ['./credit-member-wallet.component.scss']
})
export class CreditMemberWalletComponent implements OnInit {
  formRpn: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  memberNotExist: boolean;
  token: string;
  memberList: any;
  hideRequired: boolean;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private transalte: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private wallet: WalletService,
    private api: ApiService
  ) {
      this.fillRequired = false;
      this.memberNotExist = false;
      this.memberList = [];
      this.hideRequired = false;
  }

  ngOnInit() {
    this.getMembers();
    this.initFormWallet();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormWallet() {
      this.formRpn = this.fb.group({
        member_id: ['', Validators.required],
        amount: ['', Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?'), Validators.required])]
      });
  }

  get memberId() {
    return this.formRpn.get('member_id');
  }

  get montant() {
    return this.formRpn.get('amount');
  }


  // Get la liste des membres
  getMembers() {
    this.loadingShow = true;
    this.member.getListOfMembers().subscribe(members => {
     if (members && members.membres) {
      const memberList = [];
      members.membres.forEach(member => {
            if (member && member.Status_Id === 2) {
              memberList.push(member);
            }
      });
      this.memberList = this.api.oderByAlpha(memberList);
     }
    }, error => {
      this.error.manageError(error);
    });
  }


    // Create family
    creditWalletMember() {
      this.loadingShow = true;
      this.spinner.show('credit-member');

      this.wallet.creditMember(this.token, this.formRpn.value).subscribe(reponse => {

        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.transalte.get('RPN_ACCOUNT_CREDITED').subscribe(trans => {
            this.toast.success(trans);
          });
          this.wallet.sendUpdateMessage('update');
          this.initFormWallet();

        }
        this.spinner.hide('credit-member');

      }, error => {

        this.loadingShow = false;
        this.spinner.hide('credit-member');
        if (error && error.error && error.error.message === 'error') {

          if (error.error.invalid_token) {
            this.member.logout(this.token);
          }

          if (error.error.remplir_tous_les_champs) {
            this.transalte.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
              this.toast.error(trans);
            });
            this.fillRequired = true;
          }
          if (error.error.member_id_not_exist) {
            this.transalte.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
              this.toast.error(trans);
            });
            this.memberNotExist = true;
          }
        } else {
          this.error.manageError(error);
        }
      });
    }


}
