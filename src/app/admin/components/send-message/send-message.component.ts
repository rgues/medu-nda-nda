import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {

  contactForm: FormGroup;
  loading: boolean;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private activeModal: NgbActiveModal,
    private error: ErrorService,
    private member: MembreService,
    private toast: ToastrService
  ) {
    this.loading = false;
  }

  // Init the login Form
  initMessageForm() {
    this.contactForm = this.fb.group({
      content: ['', Validators.required],
    });
  }

  get message() {
    return this.contactForm.get('content');
  }

  ngOnInit() {
    this.initMessageForm();
  }

  //Send Message to members
  sendMessage() {
    this.loading = true;
      const token = this.member.getUserSession().remenber_token;
      this.member.sendMessage(token, this.contactForm.value).subscribe(reponse => {
        this.loading = false;
        if (reponse && reponse.message === 'success') {
          this.translate.get('SEND_MSG_SUCCEED').subscribe(trans => {
            this.toast.success(trans);
          });
          this.initMessageForm();
          this.activeModal.close();
        }
      }, error => {
            this.loading = false;
            if (error && error.error && error.error.message === 'error') {
              this.translate.get('SEND_MSG_FAILED').subscribe(trans => {
                this.toast.success(trans);
              });
            } else {
              this.error.manageError(error);
            }
            this.activeModal.close();
      });
    }
  

}
