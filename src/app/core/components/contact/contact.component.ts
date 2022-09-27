import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { FeedbackService } from './../../../service/feedback.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ErrorService } from 'src/app/service/error.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  contactForm: FormGroup;
  showError: boolean;
  defaultLang: string;
  captcha: string;

  constructor(
    private fb: FormBuilder,
    private feedback: FeedbackService,
    private translate: TranslateService,
    private error: ErrorService,
    private toast: ToastrService
  ) {
    this.showError = false;
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
    this.captcha = this.getRandomId();
  }


  // Get a random id
  getRandomId(): string {
    let text = '';
    const possible = 'ABCDEFGHJKLMPQRSTUVWXYZabcdefghjklmpqrstuvwxyz';
    const chiffre = '0123456789';
    for (let i = 0; i <= 5; i++) {
      if (i < 3) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      } else {
        text += chiffre.charAt(Math.floor(Math.random() * chiffre.length));
      }
    }
    return text;
  }


  // generate a new captcha
  generateCaptcha() {
    this.captcha = this.getRandomId();
  }

  // Init the login Form
  initContactLogin() {
    this.contactForm = this.fb.group({
      nom_et_prenom: ['', Validators.required],
      telephone: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9-]{4}[0-9-]{4}[0-9]{4}$')])],
      email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}[.][a-z]{2,4}$')])],
      objet: ['', Validators.required],
      captcha: ['', Validators.required],
      message: ['', Validators.required],
    });
  }


  get nomPrenom() {
    return this.contactForm.get('nom_et_prenom');
  }

  get telephone() {
    return this.contactForm.get('telephone');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get objet() {
    return this.contactForm.get('objet');
  }

  get captchaE() {
    return this.contactForm.get('captcha');
  }

  get message() {
    return this.contactForm.get('message');
  }

  ngOnInit() {
    this.initContactLogin();
  }

  // contact the admin
  createContact() {
    if (this.contactForm.value.captcha === this.captcha) {
      this.feedback.saveContacts(this.contactForm.value).subscribe(reponse => {
        if (reponse && reponse.message) {
          this.showError = false;
          this.translate.get('CONTACT_SUCCESS_MSG').subscribe(trans => {
            this.toast.success(trans);
          });
          this.feedback.sendUpdateMessage('update');
        }
      }, error => {
            if (error && error.error && error.error.message === 'error') {
              this.showError = true;
            } else {
              this.error.manageError(error);
            }
      });
    } else {
      this.translate.get('CONTACT_CAPTCHA_ERROR').subscribe(trans => {
        this.toast.error(trans);
      });
      this.generateCaptcha();
    }

  }

}
