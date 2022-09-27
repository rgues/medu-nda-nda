import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';
import { MessagesService } from 'src/app/service/messages.service';

@Component({
  selector: 'app-create-message',
  templateUrl: './create-message.component.html',
  styleUrls: ['./create-message.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class CreateMessageComponent implements OnInit {

  formMessage: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  typeNotExist: boolean;
  placeNotExist: boolean;
  token: string;
  eventPlaceList: any;
  eventsTypeList: any;
  startDate: Date;
  listMembers: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private message: MessagesService,
    private translate: TranslateService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.initFormMessage();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormMessage() {
    this.formMessage = this.fb.group({
      object: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  get object() {
    return this.formMessage.get('object');
  }

  get content() {
    return this.formMessage.get('content');
  }

  // Create a message
  createMessage() {
    this.loadingShow = true;
    this.spinner.show('create-message');
    this.message.createMessage(this.token, this.formMessage.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('MESSAGE_SAVED_SUCCESS').subscribe(trans => {
            this.toast.success(trans);
        });
        this.initFormMessage();
        this.message.sendUpdateMessage('update');
        this.router.navigate(['/message']);
      }
      this.spinner.hide('create-message');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('create-message');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

}
