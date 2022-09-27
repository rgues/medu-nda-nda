import { TranslateService } from '@ngx-translate/core';
import { FamilleService } from './../../../service/famille.service';
import { ApiService } from 'src/app/service/api.service';
import { EventsService } from './../../../service/events.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';

interface Families {
  choice: boolean;
  name: string;
  famille_id: number;
}

@Component({
  selector: 'app-family-reception-add',
  templateUrl: './family-reception-add.component.html',
  styleUrls: ['./family-reception-add.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class FamilyReceptionAddComponent implements OnInit {

  formFamilyReception: FormGroup;
  loadingShow: boolean;
  familyList: Families[];
  tempFamily: any;
  token: string;
  startDateSelect: Date;
  eventsList: any;
  eventsTypeList: any;
  eventsTypeListFilter: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private eventService: EventsService,
    private family: FamilleService,
    private api: ApiService,
    private router: Router
  ) {
    this.familyList = [];
    this.tempFamily = [];
    this.startDateSelect = new Date();
    this.eventsList = [];
    this.eventsTypeList = [];
    this.eventsTypeListFilter = [];
  }

  ngOnInit() {
    this.initFormFamilyReception();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getEventsType();
    this.getFamilyList();
    this.getEvents();
  }

  initFormFamilyReception() {
    this.formFamilyReception = this.fb.group({
      event_type_id: ['', Validators.required],
      event_id: ['', Validators.required],
      familles: [[], Validators.required]
    });
  }

  get type() {
    return this.formFamilyReception.get('event_type_id');
  }


  get event() {
    return this.formFamilyReception.get('event_id');
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
        this.eventsList = this.api.oderByEventsDate(events.events);
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

  // get the  member list
  getFamilyList() {
    this.family.getFamilyReception(this.token).subscribe(reponse => {
      if (reponse && reponse.familles_n_ayant_pas_recu) {
        this.tempFamily = reponse.familles_n_ayant_pas_recu;
        const families: Families[] = [];
        this.tempFamily.forEach(famille => {
          families.push({
            choice: false,
            famille_id: famille.famille_id,
            name: famille.family_name
          });
        });
        this.familyList = this.api.oderByAlpha(families);
        this.formFamilyReception.get('familles').setValue(families);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

   // Get the family name
   getFamilyName(familleId: number) {
    return this.family.getFamilyName(familleId, this.familyList);
  }

  // Add selected family
  getSelectedFamilies() {
    const selectFamilies: Families[] = [];
    this.familyList.forEach(famille => {
      if (famille.choice) {
        selectFamilies.push(famille);
      }
    });

    this.formFamilyReception.get('familles').setValue(selectFamilies);
  }

  // add family reception
  addFamilyReception() {
    this.loadingShow = true;
    this.spinner.show('family-recpetion');
    this.family.addfamilyReception(this.token, this.formFamilyReception.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('FAMILY_RECEPTION_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.family.sendUpdateMessage('update');
        this.initFormFamilyReception();
        this.getFamilyList();
      }
      this.spinner.hide('family-recpetion');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('family-recpetion');
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

        if (error.error.famille_id_not_exist) {
          this.translate.get(['FAMILY_TEXT','FAMILY_TEXT_NOT_EXIST']).subscribe(trans => {
            this.toast.error(`${trans.FAMILY_TEXT} ${this.getFamilyName(error.error.famille_id)} ${trans.FAMILY_TEXT_NOT_EXIST}`);
          });
          
        }

        if (error.error.famille_id_a_deja_recu) {
          this.translate.get(['FAMILY_TEXT','FAMILY_TEXT_NOT_EXIST']).subscribe(trans => {
            this.toast.error(`${trans.FAMILY_TEXT} ${this.getFamilyName(error.error.famille_id)} ${trans.FAMILY_TEXT_HAS_RECEIVE}`);
          });
        
        }

      } else {
        this.error.manageError(error);
      }
    });
  }


}
