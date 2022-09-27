import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/service/api.service';
import { EventsService } from './../../../service/events.service';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class CreateEventComponent implements OnInit {

  formEvent: FormGroup;
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
    private eventService: EventsService,
    private translate: TranslateService,
    private api: ApiService,
    private router: Router
  ) {
    this.fillRequired = false;
    this.typeNotExist = false;
    this.placeNotExist = false;
    this.eventPlaceList = [];
    this.eventsTypeList = [];
    this.startDate = new Date();
    this.listMembers = [];
  }

  ngOnInit() {
    this.getEventsLocation();
    this.getEventsType();
    this.initFormEvent();
    this.getMembers();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormEvent() {
    this.formEvent = this.fb.group({
      event_type_id: ['', Validators.required],
      date_event: [this.startDate, Validators.required],
      nom_event_fr: ['', Validators.required],
      nom_event_en: ['', Validators.required],
      event_place_id: ['', Validators.required],
      frais_par_membre: [0, Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?')])],
      date_echeance: [this.startDate, Validators.required],
      frais_retard: [0, Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?')])],
      frais_absence: [0, Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?')])],
      member_id: [0]
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

  // Get the list of members
    getMembers() {
      this.member.getListOfMembers().subscribe(members => {
        const actifMembers = [];
        const inactifMembers = [];
        let listMembers = [];
        members.membres.forEach(memb => {
          if (memb.Status_Id === 2) {
            actifMembers.push(memb);
          } else {
            inactifMembers.push(memb);
          }
        });
        listMembers = actifMembers.concat(inactifMembers);
        this.listMembers = listMembers;
      }, error => {
        this.error.manageError(error);
      });
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

  // Create Event
  createEvent() {
    this.loadingShow = true;
    this.spinner.show('create-event');

    this.formEvent.get('date_event').setValue(this.api.formatDateTiret(this.formEvent.value.date_event));
    this.formEvent.get('date_echeance').setValue(this.api.formatDateTiret(this.formEvent.value.date_echeance));
    this.eventService.createEvent(this.token, this.formEvent.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_ADD_EVENT_SUCCESS').subscribe(trans => {
            this.toast.success(trans);
        });
        this.initFormEvent();
        this.eventService.sendUpdateMessage('update');
        this.router.navigate(['/events']);
      }
      this.spinner.hide('create-event');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('create-event');
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
