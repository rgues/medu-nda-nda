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
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showError: boolean;
  loading: boolean;

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private membre: MembreService,
    private translate: TranslateService,
    private toast: ToastrService,
    private router: Router,
    private error: ErrorService
    ) {
      this.showError = false;
      this.loading = false;
    }

    // Init the login Form
initLogin() {
  this.loginForm = this.fb.group({
    email_or_username: ['', Validators.required],
    password: ['', Validators.required]
  });
}

  get username() {
    return this.loginForm.get('email_or_username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  ngOnInit() {
    this.initLogin();
  }

  // Go to the forgot password Page
  forgotPass() {
    this.activeModal.dismiss();
    this.router.navigate(['forgot-pass']);
  }


  // login in the system
  login() {
    this.loading = true;
    this.membre.login(this.loginForm.value).subscribe(reponse => {
      this.loading = false;
      if (reponse && reponse.message === 'success') {
        this.membre.setUserSession(reponse.user);
        this.membre.setUserSecret(this.loginForm.value);
        this.activeModal.dismiss();
        this.router.navigate(['/admin/profile', reponse.user.member_id]);
      }

    }, error => {
      this.loading = false;
      if (error && error.error && error.error.message === 'error') {

        if (error.error.user_not_found) {
            this.translate.get('LOGIN_USER_NOT_FOUND').subscribe(trans => {
                this.toast.error(trans);
            });
        }

        if (error.error.user_suspendu) {
          this.translate.get('LOGIN_USER_SUSPEND').subscribe(trans => {
            this.toast.error(trans);
        });

        }

        if (error.error.user_exclu) {
          this.translate.get('LOGIN_USER_EXCLUDE').subscribe(trans => {
            this.toast.error(trans);
        });

        }

      } else {
        this.error.manageError(error);
      }
    });
  }

}
