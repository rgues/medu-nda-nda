import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/service/api.service';
import { EventsService } from './../../../service/events.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class EventDetailComponent implements OnInit {

  formEvent: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  typeNotExist: boolean;
  placeNotExist: boolean;
  token: string;
  eventPlaceList: any;
  eventsTypeList: any;
  startDate: Date;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private translate: TranslateService,
    private eventService: EventsService,
    private api: ApiService,
    private router: Router
  ) {
    this.fillRequired = false;
    this.typeNotExist = false;
    this.placeNotExist = false;
    this.eventPlaceList = [];
    this.eventsTypeList = [];
    this.startDate = new Date();
  }

  ngOnInit() {
    this.getEventsLocation();
    this.getEventsType();
    this.initFormEvent();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormEvent() {
    const eventData = this.eventService.getEventSession();
    this.formEvent = this.fb.group({
      event_id: [eventData.event_id || '', Validators.required],
      event_type_id: [eventData.event_type_id || '', Validators.required],
      date_event: [eventData.event_date ? new Date(eventData.event_date) : this.startDate, Validators.required],
      nom_event_fr: [eventData.language_code === 'fr' ? eventData.description : '', Validators.required],
      nom_event_en: [eventData.language_code === 'en' ? eventData.description : '', Validators.required],
      event_place_id: [eventData.event_place_id || '', Validators.required],
      frais_par_membre: [eventData.amount_due || 0, Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?'),  Validators.required])],
      date_echeance: [eventData.due_date ? new Date(eventData.due_date) : this.startDate, Validators.required],
      frais_retard: [eventData.lateness_fee || 0, Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?')])],
      frais_absence: [eventData.absence_fee || 0, Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?')])]
    });
  }

  get eventType() {
    return this.formEvent.get('event_type_id');
  }

  get dateEventError() {
    return this.formEvent.get('date_event');
  }

  get nomEventFr() {
    return this.formEvent.get('nom_event_fr');
  }

  get nomEventEn() {
    return this.formEvent.get('nom_event_en');
  }

  get placeEvent() {
    return this.formEvent.get('event_place_id');
  }

  get memberFees() {
    return this.formEvent.get('frais_par_membre');
  }

  get dueDateError() {
    return this.formEvent.get('date_echeance');
  }

  get lateFees() {
    return this.formEvent.get('frais_retard');
  }

  get absenceFees() {
    return this.formEvent.get('frais_absence');
  }


  // update the event due date
  updateEndEvent() {
    if (this.formEvent.value.date_event) {
      this.formEvent.get('date_echeance').setValue(new Date(this.formEvent.value.date_event));
    }
  }

  // get the events type list
  getEventsLocation() {
    this.eventService.getEventLocation().subscribe(events => {
      if (events && events.places) {
        this.eventPlaceList = events.places;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // get the events type list
  getEventsType() {
    this.eventService.getEventType().subscribe(events => {
      if (events && events.events) {
        this.eventsTypeList = events.events;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Update Event
  updateEvent() {
    this.loadingShow = true;
    this.spinner.show('update-event');

    this.formEvent.get('date_event').setValue(this.api.formatDateTiret(this.formEvent.value.date_event));
    this.formEvent.get('date_echeance').setValue(this.api.formatDateTiret(this.formEvent.value.date_echeance));
    this.eventService.updateEvent(this.token, this.formEvent.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_UPDATE_EVENT_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.eventService.sendUpdateMessage('update');
        this.initFormEvent();
        this.router.navigate(['/events']);
      }
      this.spinner.hide('update-event');

    }, error => {
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

        if (error.error.event_type_id_not_exist) {
          this.translate.get('EVENT_TYPE_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
          this.typeNotExist = true;
        }

        if (error.error.event_place_id_not_exist) {
          this.translate.get('EVENT_PLACE_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
          this.placeNotExist = true;
        }

      } else {
        this.error.manageError(error);
      }
    });
  }
}
