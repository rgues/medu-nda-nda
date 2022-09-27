import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import { EventsService } from 'src/app/service/events.service';

@Component({
  selector: 'app-update-event-picture',
  templateUrl: './update-event-picture.component.html',
  styleUrls: ['./update-event-picture.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class UpdateEventPictureComponent implements OnInit {

  pictureForm: FormGroup;
  typeMimeError: boolean;
  defaultLang: string;
  eventsTypeList: any;
  eventsList: any;
  eventsTypeListFilter: any;
  loadingShow: boolean;
  token: string;

  constructor(
    private fb: FormBuilder,
    private eventService: EventsService,
    private error: ErrorService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.typeMimeError = false;
    this.eventsTypeList = [];
    this.eventsList = [];
    this.eventsTypeListFilter = [];
    this.loadingShow = false;
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  ngOnInit() {
    this.getEventsType();
    this.getEvents();
    this.initFormReoprt();
  }

  initFormReoprt() {
    const eventData = this.eventService.getEventSession();
    this.pictureForm = this.fb.group({
      event_id: [eventData ? eventData.event_id : '', Validators.required],
      picture_id: [eventData ? eventData.id : '', Validators.required],
      picture: [eventData ? eventData.picture : '', Validators.required],
    });
  }

  get event() {
    return this.pictureForm.get('event_id');
  }

  get type() {
    return this.pictureForm.get('event_type_id');
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

  // get the family list
  getEvents() {
    this.eventService.getEvents().subscribe(events => {
      if (events && events.events) {
        this.eventsList = events.events;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Filter Events Type
  filtersEvents(typeId: number) {
    const eventsType = [];
    this.eventsList.forEach(event => {
      if (event.event_type_id === typeId) {
        eventsType.push(event);
      }
    });
    this.eventsTypeListFilter = eventsType;
  }

  // Get the report
  getDocument(event) {
    this.typeMimeError = false;
    if (event) {
      if (event.filemime === 'image/jpeg' || event.filemime === 'image/gif' ||
      event.filemime === 'image/png' || event.filemime === 'image/svg+xml') {
        const imageFormat = 'data:' + event.filemime + ';base64,' + event.data;
        this.pictureForm.get('picture').setValue(imageFormat);
      } else {
        this.typeMimeError = true;
      }
    }
  }

  // update picture
  updatePicture() {
    this.loadingShow = true;
    this.spinner.show('save-picture');
    this.eventService.updatePicture(this.token, this.pictureForm.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('PICTURE_UPDATED_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormReoprt();
        this.eventService.sendUpdateMessage('update');
        this.router.navigate(['/picture-event/list-picture',this.pictureForm.value.event_id]);
      }
      this.spinner.hide('save-picture');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('save-picture');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.event_id_not_exist) {
          this.translate.get('EVENT_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
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
