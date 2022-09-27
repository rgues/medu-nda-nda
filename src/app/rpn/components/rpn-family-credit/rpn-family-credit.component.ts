import { ApiService } from './../../../service/api.service';
import { TranslateService } from '@ngx-translate/core';
import { RpnService } from './../../../service/rpn.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-rpn-family-credit',
  templateUrl: './rpn-family-credit.component.html',
  styleUrls: ['./rpn-family-credit.component.scss']
})
export class RpnFamilyCreditComponent implements OnInit {
  formRpn: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  familyNameExist: boolean;
  token: string;
  familyList: any;
  hideRequired: boolean;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private family: FamilleService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private rpn: RpnService,
    private api: ApiService
  ) {
      this.fillRequired = false;
      this.familyNameExist = false;
      this.familyList = [];
      this.hideRequired = false;
  }

  ngOnInit() {
    this.getFamily();
    this.initFormRpn();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormRpn() {
      this.formRpn = this.fb.group({
        family_id: ['', Validators.required],
        amount: ['', Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?'), Validators.required])]
      });
  }

  get famille() {
    return this.formRpn.get('family_id');
  }

  get montant() {
    return this.formRpn.get('amount');
  }

    // get families list
    getFamily() {
      this.family.getFamily().subscribe(families => {
        if (families && families.familles) {
          this.familyList = this.api.oderByFamilyName(families.familles);
        }
      }, error => {
        this.error.manageError(error);
      });
    }

    // Create family
    creditRPNFamily() {
      this.loadingShow = true;
      this.spinner.show('credit-rpn');

      this.rpn.creditRPNfamilyAccount(this.token, this.formRpn.value).subscribe(reponse => {
        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('RPN_ACCOUNT_CREDITED').subscribe(trans => {
            this.toast.success(trans);
          });
          this.rpn.sendUpdateMessage('update');
          this.initFormRpn();
        }
        this.spinner.hide('credit-rpn');

      }, error => {

        this.loadingShow = false;
        this.spinner.hide('credit-rpn');
        if (error && error.error && error.error.message === 'error') {
          if (error.error.invalid_token) {
            this.member.logoutMember();
          }
          if (error.error.remplir_tous_les_champs) {
            this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
              this.toast.error(trans);
            });
            this.fillRequired = true;
          }
          if (error.error.family_id_not_exist) {
            this.translate.get('FAMILY_TEXT', 'FAMILY_TEXT_NOT_EXIST').subscribe(trans => {
              this.toast.error(`${trans.FAMILY_TEXT} ${trans.FAMILY_TEXT_NOT_EXIST}`);
            });
            this.familyNameExist = true;
          }
        } else {
          this.error.manageError(error);
        }
      });
    }


}
