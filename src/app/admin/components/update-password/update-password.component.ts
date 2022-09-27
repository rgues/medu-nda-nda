import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from './../../../service/membre.service';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {
  updatePassForm: FormGroup;
  showError: boolean;
  loading: boolean;
  user: any;

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private membre: MembreService,
    private error: ErrorService,
    private translate: TranslateService,
    private toast: ToastrService
    ) {
      this.showError = false;
      this.loading = false;
      this.user = this.membre.getUserSession();
    }

    // Init the login Form
initLogin() {
  this.updatePassForm = this.fb.group({
    password: ['', Validators.required],
    passwordConfirm: ['', Validators.required]
  });
}

  get password() {
    return this.updatePassForm.get('password');
  }
  get passwordConfirm() {
    return this.updatePassForm.get('passwordConfirm');
  }

  ngOnInit() {
    this.initLogin();
  }


  // login in the system
  updatePawword() {
    this.loading = true;
    this.membre.updateMemberpassword(this.updatePassForm.value, this.user.remenber_token).subscribe(reponse => {
      this.loading = false;
      if (reponse && reponse.message === 'success') {

        this.translate.get('PASSWOR_UPDATE_MESSAGE').subscribe(trans => {
            this.toast.success(trans);
        });
        const secret = this.membre.getUserSecret();
        const secretData = {
          email_or_username: secret.email_or_username,
          password: this.updatePassForm.value.password
        };
        this.membre.setUserSecret(secretData);
        this.membre.login(secretData).subscribe((data: any) => {
          if (data && data.message === 'success') {
            this.membre.setUserSession(data.user);
          }
        }, error => {
          this.error.manageError(error);
        });

        this.activeModal.dismiss();
      }

    }, error => {
      this.loading = false;
      if (error && error.error && error.error.invalid_token) {
          this.membre.logoutMember();
      } else {
        this.error.manageError(error);
      }
    });
  }

}
