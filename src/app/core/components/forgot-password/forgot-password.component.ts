import { PasswordService } from './../../../service/password.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  userSecurityForm: FormGroup;
  loading: boolean;
  validatorEmailOrPhone: boolean;
  codePin: string;
  userData: any;

  languageTranslation: any;
  SuccessMsg1: any;
  SuccessMsg2: any;
  ErrorMsg1: any;
  ErrorMsg2: any;
  ErrorMsg4: any;
  ErrorMsg5: any;
  ErrorMsg6: any;

  constructor(
    private fb: FormBuilder,
    private errorService: ErrorService,
    private userService: MembreService,
    private location: TranslateService,
    private toast: ToastrService,
    private pass: PasswordService
  ) {
    this.loading = false;
    this.validatorEmailOrPhone = false;
  }

  get emailOrphone() {
    return this.userSecurityForm.get('email_or_phone');
  }

  get code() {
    return this.userSecurityForm.get('code');
  }

  get password() {
    return this.userSecurityForm.get('password');
  }

  get confirmPassword() {
    return this.userSecurityForm.get('confirmPassword');
  }

  ngOnInit() {
    this.userData = this.userService.getMemberSession();
    this.initPassForm();
  }

  initPassForm() {
    this.userSecurityForm = this.fb.group({
      member_id: [''],
      email_or_phone: ['', Validators.required],
      code: [''],
      password: [''],
      confirmPassword: ['']
    });
  }

  validateEmail(myEmail: string) {
    const regex = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
    if (!regex.test(myEmail)) {
      return false;
    } else {
      return true;
    }
  }

  validatePhone(myPhone: string) {
    const regex = /^[0-9]{9,13}$/;
    if (!regex.test(myPhone)) {
      return false;
    } else {
      return true;
    }
  }

  // Check the email or phone
  checkEmailOrPhone(inputValue: string) {
    this.validatorEmailOrPhone = !this.validateEmail(inputValue) && !this.validatePhone(inputValue);
    if (!this.validatorEmailOrPhone) {
      this.emailOrphone.setErrors({ invalid: true });
    }
  }

  // Cancel the modal
  cancel() {
    this.initPassForm();
  }

  // Get code to change the password
  getCode() {
    this.loading = true;
    this.pass.getCode(this.userSecurityForm.value).subscribe(
      (reponse: any) => {
        this.loading = false;
        if (reponse && reponse.message === 'success') {
          this.codePin = reponse.code;
          this.userSecurityForm.get('code').setValue('');
          this.location.get('CODE_SUCCESS').subscribe(value => {
            this.toast.success(value);
          });
        }
      }, error => {
        this.loading = false;
        if (error && error.error) {

          if (error.error.email_not_exit) {
            this.location.get('EMAIL_NOT_EXIST').subscribe(value => {
              this.toast.error(value);
            });
          }

          if (error.error.phone_not_exist) {
            this.location.get('PHONE_NOT_EXIST').subscribe(value => {
              this.toast.error(value);
            });
          }
        } else {
          this.errorService.manageError(error);
        }
      });
  }


  // Change the user password
  changePassword() {
    this.loading = true;
    this.pass.changeForgotPassword(this.userSecurityForm.value).subscribe(
      (reponse: any) => {
        this.loading = false;
        if (reponse && reponse.message === 'success') {
          this.location.get('PASS_UPDATED').subscribe(value => {
            this.toast.success(value);
          });
          this.initPassForm();
        }
      }, error => {
        this.loading = false;
        if (error && error.error) {
          if (error.error.user_not_confirm_code) {
            this.location.get('CODE_NOT_CONFIRM').subscribe(value => {
              this.toast.error(value);
            });
          }

          if (error.error.invalid_token) {
            this.location.get('CODE_NOT_CONFIRM').subscribe(value => {
              this.toast.error(value);
            });
          }

        } else {
          this.errorService.manageError(error);
        }
      });
  }

  // Check the user code
  checkCode() {
    this.loading = true;
    this.pass.confirmCode(this.userSecurityForm.value).subscribe(
      (reponse: any) => {
        this.loading = false;
        if (reponse && reponse.message === 'success') {
          this.userSecurityForm.get('member_id').setValue(reponse.user.member_id);
          this.changePassword();
        }
      }, error => {
        this.loading = false;
        if (error && error.error) {
          if (error.error.code_not_exist) {
            this.location.get('CODE_NOT_EXIST').subscribe(value => {
              this.ErrorMsg5 = value;
            });
            this.toast.error(this.ErrorMsg5);
          } else if (error.error.code_has_expired) {
            this.location.get('CODE_HAS_EXIPRED').subscribe(value => {
              this.ErrorMsg6 = value;
            });
            this.toast.error(this.ErrorMsg6);
          }
        } else {
          this.errorService.manageError(error);
        }
      });
  }

  // Update the user password
  updatePassword() {
    if (this.userSecurityForm.value.email_or_phone && !this.userSecurityForm.value.code) {
      this.getCode();
    } else if (this.userSecurityForm.value.email_or_phone && this.userSecurityForm.value.code && this.userSecurityForm.value.password) {
      this.checkCode();
    }
  }

}
