import { TranslateService } from '@ngx-translate/core';
import { EventsService } from './../../../service/events.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-update-event-type',
  templateUrl: './update-event-type.component.html',
  styleUrls: ['./update-event-type.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class UpdateEventTypeComponent implements OnInit {

  formEvent: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  typeNameExist: boolean;
  token: string;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbActiveModal,
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
      const eventTypeData = this.events.getEventSession();
      this.formEvent = this.fb.group({
        event_type_id: [eventTypeData.event_type_id ? eventTypeData.event_type_id : '', Validators.required],
        description_fr: [eventTypeData.language_code === 'fr' ? eventTypeData.event_type_desc : '', Validators.required],
        description_en: [eventTypeData.language_code === 'en' ? eventTypeData.event_type_desc : '', Validators.required]
      });
  }

  get titleEn() {
    return this.formEvent.get('description_en');
  }

  get titleFr() {
    return this.formEvent.get('description_fr');
  }

    // Update the event type
    updateEventType() {
      this.loadingShow = true;
      this.spinner.show('update-event');

      this.events.updateEventType(this.token, this.formEvent.value).subscribe(reponse => {

        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('EVENT_TYPE_UPDATE_SUCCESS').subscribe(trans => {
              this.toast.success(trans);
          });
          this.events.sendUpdateMessage('update');
          this.initFormEventType();
          this.modalService.dismiss();
        }
        this.spinner.hide('update-event');

      }, error => {
        this.modalService.dismiss();
        this.loadingShow = false;
        this.spinner.hide('update-event');
        if (error && error.error && error.error.message === 'error') {

          if (error.error.invalid_token) {
            this.member.logoutMember();
          }

          if (error.error.remplir_tous_les_champs) {
            this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
              this.toast.error(trans);
            });
            this.fillRequired = true;
          }

          if (error.error.event_type_name_already_exist) {
            this.translate.get('EVENT_TYPE_EXIST').subscribe(trans => {
              this.toast.error(trans);
            });
            this.typeNameExist = true;
          }

        } else {
          this.error.manageError(error);
        }
      });
    }
}
