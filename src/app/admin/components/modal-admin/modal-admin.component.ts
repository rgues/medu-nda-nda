import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MembreService } from 'src/app/service/membre.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';
import { ErrorService } from 'src/app/service/error.service';

@Component({
  selector: 'app-modal-admin',
  templateUrl: './modal-admin.component.html',
  styleUrls: ['./modal-admin.component.scss']
})
export class ModalAdminComponent implements OnInit {
  modalData: any;
  user: any;
  statusList: any;
  roleList: any;
  formMember: FormGroup;
  loadingShow: boolean;

  constructor(
    private modalService: NgbActiveModal,
    private fb: FormBuilder,
    private member: MembreService,
    private translate: TranslateService,
    private error: ErrorService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) {
      this.statusList = [];
      this.roleList = [];
      this.user = this.member.getUserSession();
      this.initFormMember();
      member.getMessageModalAdmin().subscribe(modalParam => {
          this.modalData = modalParam.modalData;
          this.formMember.get('member_id').setValue(this.modalData.memberParams.member_id);
          this.formMember.get('token').setValue(this.user.remenber_token);
      });
   }

  ngOnInit() {
    this.getRole();
    this.getStatus();
  }

  initFormMember() {
    this.loadingShow = false;
    this.formMember = this.fb.group({
      member_id: ['', Validators.required],
      token: ['', Validators.required],
      status_id: [''],
      role_id: ['']
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


    // Get the list of status
    getStatus() {
      this.member.getStatut().subscribe(status => {
        if (status && status.status) {
          this.statusList = status.status;
        }
      }, error => {
        this.error.manageError(error);
      });
    }

  // update the statut
  updateMemberStatut() {
    this.loadingShow = true;
    this.spinner.show('update-member');
    this.member.updateMemberStatut(this.formMember.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('MODAL_ADMIN_UPDATE_SUCCESS_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormMember();
        this.member.sendUpdateMessage('update');
        this.modalService.dismiss();
      }
      this.spinner.hide('update-member');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('update-member');
      this.modalService.dismiss();
      if (error && error.error && error.error.message === 'error') {

        if (error.error.status_not_found) {
          this.translate.get('MODAL_ADMIN_STATUS_ERROR_MSG').subscribe(trans => {
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


    // update the statut
    updateMemberRole() {
      this.loadingShow = true;
      this.spinner.show('update-member');
      this.member.updateMemberRole(this.formMember.value).subscribe(reponse => {

        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('MODAL_ADMIN_ROLE_SUCCESS_MSG').subscribe(trans => {
            this.toast.success(trans);
          });
          this.initFormMember();
          this.member.sendUpdateMessage('update');
          this.modalService.dismiss();
        }
        this.spinner.hide('update-member');

      }, error => {
        this.loadingShow = false;
        this.spinner.hide('update-member');
        this.modalService.dismiss();
        if (error && error.error && error.error.message === 'error') {

          if (error.error.role_not_found) {
            this.translate.get('MODAL_ADMMODAL_ADMIN_ROLE_ERROR_MSGIN_ROLE_SUCCESS_MSG').subscribe(trans => {
              this.toast.success(trans);
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

    // update the member informations
    updateMember() {
        switch (this.modalData.actionParams) {
          case 'statut' :
            this.updateMemberStatut();
            break;
          case 'role':
            this.updateMemberRole();
            break;
          default:
            break;
        }
    }

}
