import { TranslateService } from '@ngx-translate/core';
import { EventsService } from './../../../service/events.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MembreService } from 'src/app/service/membre.service';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-create-event-type',
  templateUrl: './create-event-type.component.html',
  styleUrls: ['./create-event-type.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class CreateEventTypeComponent implements OnInit {

  formEvent: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  typeNameExist: boolean;
  token: string;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbActiveModal,
    private translate: TranslateService,
    private events: EventsService
  ) {
      this.fillRequired = false;
      this.typeNameExist = false;
  }

  ngOnInit() {
    this.initFormEventType();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormEventType() {
      this.formEvent = this.fb.group({
        description_fr: ['', Validators.required],
        description_en: ['', Validators.required]
      });
  }

  get titleEn() {
    return this.formEvent.get('description_en');
  }

  get titleFr() {
    return this.formEvent.get('description_fr');
  }

    // Create the event type
    createEventType() {
      this.loadingShow = true;
      this.spinner.show('create-event');

      this.events.saveEventType(this.token, this.formEvent.value).subscribe(reponse => {

        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('EVENT_TYPE_ADD_SUCCESS').subscribe(trans => {
            this.toast.success(trans);
          });
          this.events.sendUpdateMessage('update');
          this.initFormEventType();
          this.modalService.dismiss();
        }
        this.spinner.hide('create-event');

      }, error => {
        this.modalService.dismiss();
        this.loadingShow = false;
        this.spinner.hide('create-event');
        if (error && error.error && error.error.message === 'error') {

          if (error.error.invalid_token) {
            this.member.logoutMember();
          }

          if (error.error.remplir_tous_les_champs) {
            this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
              this.toast.success(trans);
            });
            this.fillRequired = true;
          }

          if (error.error.event_type_name_already_exist) {
            this.translate.get('EVENT_TYPE_EXIST').subscribe(trans => {
              this.toast.success(trans);
            });
            this.typeNameExist = true;
          }

        } else {
          this.error.manageError(error);
        }
      });
    }
}
