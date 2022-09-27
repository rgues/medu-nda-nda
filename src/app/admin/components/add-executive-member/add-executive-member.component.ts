import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FamilleService } from './../../../service/famille.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from './../../../service/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ErrorService } from 'src/app/service/error.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { NgxSpinnerService } from 'ngx-spinner';
import { slideInLeft } from '../../../animations';

@Component({
  selector: 'app-add-executive-member',
  templateUrl: './add-executive-member.component.html',
  styleUrls: ['./add-executive-member.component.scss'],
  animations: [
    slideInLeft
  ]

})
export class AddExecutiveMemberComponent implements OnInit {

  loadingShow: boolean;
  roleList: any;
  user: any;
  membersList: any;
  defaultDate: Date;
  formMember: FormGroup;

  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private api: ApiService,
    private member: MembreService,
    private activeModal: NgbActiveModal,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) {
    this.loadingShow = false;
    this.roleList = [];
    this.membersList = [];
    this.defaultDate = new Date();
  }

  ngOnInit() {
    this.initFormMember();
    this.getRole();
    this.getMembers();
    this.user = this.member.getUserSession();
  }





  initFormMember() {
    this.loadingShow = false;
    const dateDemande = new Date();

    this.formMember = this.fb.group({
      member_id: ['', Validators.compose([Validators.required])],
      executive_id: ['', Validators.compose([Validators.required])],
      start_date: [''],
      end_date: [''],
      startDate: [dateDemande, Validators.compose([Validators.required])],
      endDate: [dateDemande, Validators.compose([Validators.required])]
    });
  }

  // form getters
  get memberId() {
    return this.formMember.get('member_id');
  }

  get executiveId() {
    return this.formMember.get('executive_id');
  }

  get dateEndError() {
    return this.formMember.get('endDate');
  }

  get dateStartError() {
    return this.formMember.get('startDate');
  }





  // Add executive member
  addMember() {
    this.loadingShow = true;
    this.spinner.show('create-member');
    this.formMember.get('start_date').setValue(this.api.formatDateTiret( this.formMember.value.startDate));
    this.formMember.get('end_date').setValue(this.api.formatDateTiret( this.formMember.value.endDate));
    this.member.addExecutiveMember(this.formMember.value, this.user.remenber_token).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.member.sendUpdateMessage('update');
        this.translate.get('PROFILE_UPDATE_MEMBER_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
      }
      this.activeModal.dismiss();
      this.spinner.hide('create-member');

    }, error => {
      this.loadingShow = false;
      this.activeModal.dismiss();
      this.spinner.hide('create-member');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.remplir_tous_les_champs_required) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.member_id_not_exist) {
          this.translate.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.executive_id_not_exist) {
          this.translate.get('MODAL_ADMIN_ROLE_ERROR_MSG').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.invalid_token) {
            this.member.logoutMember();
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

  // Get the list of roles
  getRole() {
    this.member.getRoles().subscribe(roles => {
      if (roles && roles.role) {
        this.roleList = roles.role;
      }
    }, error => {
      this.error.manageError(error);
    });
  }


  // Get the list of source
  getMembers() {
    this.member.getListOfMembers().subscribe(membres => {
      if (membres && membres.membres) {
        this.membersList = this.api.oderByAlpha(membres.membres);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

}
