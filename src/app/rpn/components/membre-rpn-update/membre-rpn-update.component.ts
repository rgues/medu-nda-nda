import { TranslateService } from '@ngx-translate/core';
import { RpnService } from './../../../service/rpn.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-membre-rpn-update',
  templateUrl: './membre-rpn-update.component.html',
  styleUrls: ['./membre-rpn-update.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class MembreRpnUpdateComponent implements OnInit {

  formFamily: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  familyNameExist: boolean;
  familyIdNotExist: boolean;
  familyList: any;
  statusList: any;
  token: string;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private member: MembreService,
    private translate: TranslateService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbActiveModal,
    private rpn: RpnService
  ) {
    this.fillRequired = false;
    this.familyNameExist = false;
    this.familyIdNotExist = false;
    this.familyList = [];
    this.statusList = [];
  }

  ngOnInit() {
    this.initFormFamily();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormFamily() {
    const currentFamily = this.rpn.getMemberRpn();
    let familyData = {
      rpn_id: '',
      family_id: '',
      family_member_name: '',
      family_member_status: 0
    };

    if (currentFamily) {
      familyData = currentFamily;
    }

    this.formFamily = this.fb.group({
      rpn_id: [familyData.rpn_id, Validators.required],
      family_id: [familyData.family_id, Validators.required],
      family_member_name: [familyData.family_member_name, Validators.required],
      family_member_status: [familyData.family_member_status, Validators.required]
    });
  }

  get rpnId() {
    return this.formFamily.get('rpn_id');
  }

  get familyId() {
    return this.formFamily.get('family_id');
  }

  get familyMemberName() {
    return this.formFamily.get('family_member_name');
  }


  get familyMemberStatus() {
    return this.formFamily.get('family_member_status');
  }

  // update  family
  updateRPNMember() {
    this.loadingShow = true;
    this.spinner.show('update-rpn-member');

    this.rpn.updateRPNMember(this.token, this.formFamily.value).subscribe(reponse => {
      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('RPN_MEMBER_UPDATE_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormFamily();
        this.modalService.dismiss();
        this.rpn.sendUpdateMessage('update');
        this.router.navigate(['/rpn']);
      }
      this.spinner.hide('update-rpn-member');

    }, error => {
      this.modalService.dismiss();
      this.loadingShow = false;
      this.spinner.hide('update-rpn-member');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.family_id_not_exist) {
          this.translate.get('FAMILY_TEXT', 'FAMILY_TEXT_NOT_EXIST').subscribe(trans => {
            this.toast.error(`${trans.FAMILY_TEXT} ${trans.FAMILY_TEXT_NOT_EXIST}`);
          });
          this.fillRequired = true;
        }

        if (error.error.family_name_already_exist) {
          this.translate.get('FAMILY_NAME_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
          this.familyNameExist = true;
        }

        if (error.error.rpn_id_not_exist) {
          this.translate.get('RPN_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
          this.familyNameExist = true;
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

}
