import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RapportService } from './../../../service/rapport.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { EventsService } from './../../../service/events.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-add-event-report',
  templateUrl: './add-event-report.component.html',
  styleUrls: ['./add-event-report.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddEventReportComponent implements OnInit {

  reportForm: FormGroup;
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
    private report: RapportService,
    private router: Router
  ) {
    this.typeMimeError = false;
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
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
    this.reportForm = this.fb.group({
      event_id: ['', Validators.required],
      event_type_id: ['', Validators.required],
      title_fr: [''],
      title_en: [''],
      content_fr: [''],
      content_en: ['']
    });
  }

  get event() {
    return this.reportForm.get('event_id');
  }

  get type() {
    return this.reportForm.get('event_type_id');
  }

  get contentFr() {
    return this.reportForm.get('content_fr');
  }

  get contentEn() {
    return this.reportForm.get('content_en');
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

  // update the document
  updateDocument(imageFormat: any) {
    this.defaultLang === 'fr' ? this.reportForm.get('content_fr').setValue(imageFormat) :
      this.reportForm.get('content_en').setValue(imageFormat);
  }

  // Get the report
  getDocument(event) {
    this.typeMimeError = false;
    this.updateDocument('');
    if (event) {
      if (event.filemime === 'application/pdf') {
        const imageFormat = event.data;
        this.updateDocument(imageFormat);
      } else {
        this.typeMimeError = true;
      }
    }
  }


  // save the report
  saveReport() {
    this.loadingShow = true;
    this.spinner.show('save-report');
    this.report.saveReport(this.token, this.reportForm.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_ADD_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormReoprt();
        this.report.sendUpdateMessage('update');
        this.router.navigate(['/report/reports']);
      }
      this.spinner.hide('save-report');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('save-report');
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
