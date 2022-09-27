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
  selector: 'app-update-event-location',
  templateUrl: './update-event-location.component.html',
  styleUrls: ['./update-event-location.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class UpdateEventLocationComponent implements OnInit {

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
      const eventLocationData = this.events.getEventSession();
      const eventLocation = eventLocationData ? JSON.parse(eventLocationData) :  this.events.getEventSession();
      this.formEvent = this.fb.group({
        place_id: [eventLocation.place_id || '', Validators.required],
        adresse: [eventLocation.place_address || '', Validators.required],
        nom_lieu_fr: [eventLocation.language_code === 'fr' ? eventLocation.place_address : '', Validators.required],
        nom_lieu_en: [eventLocation.language_code === 'en' ? eventLocation.place_address : '', Validators.required]
      });
  }

  get adresse() {
    return this.formEvent.get('adresse');
  }

  get lieuEn() {
    return this.formEvent.get('nom_lieu_en');
  }

  get lieuFr() {
    return this.formEvent.get('nom_lieu_fr');
  }

    // Update the event location
    updateEventLocation() {
      this.loadingShow = true;
      this.spinner.show('update-event');

      this.events.updateEventLocation(this.token, this.formEvent.value).subscribe(reponse => {

        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('EVENT_PLACE_UPDATE_SUCCESS').subscribe(trans => {
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
            this.translate.get('CREATE_MEMBER_PICTURE_MESSAGE_ERROR1').subscribe(trans => {
              this.toast.error(trans);
            });
            this.fillRequired = true;
          }

          if (error.error.event_type_name_already_exist) {
            this.translate.get('EVENT_PLACE_EXIST').subscribe(trans => {
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
