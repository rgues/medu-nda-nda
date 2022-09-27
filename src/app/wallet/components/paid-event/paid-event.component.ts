import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../service/api.service';
import { EventsService } from '../../../service/events.service';
import { ErrorService } from '../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';

interface Members {
  choice: boolean;
  name: string;
  member_id: number;
}

@Component({
  selector: 'app-paid-event',
  templateUrl: './paid-event.component.html',
  styleUrls: ['./paid-event.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class PaidEventComponent implements OnInit {

  formEventFees: FormGroup;
  loadingShow: boolean;
  memberList: Members[];
  tempMember: any;
  token: string;
  startDateSelect: Date;
  eventsList: any;
  eventsTypeList: any;
  eventsTypeListFilter: any;
  eventsFeesTypeList: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private eventService: EventsService,
    private api: ApiService
  ) {
    this.memberList = [];
    this.tempMember = [];
    this.startDateSelect = new Date();
    this.eventsList = [];
    this.eventsTypeList = [];
    this.eventsTypeListFilter = [];
    this.eventsFeesTypeList = [];
  }

  ngOnInit() {
    this.initFormEventFees();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getEventsType();
    this.getEventsFeesType();
    this.getMembersList();
    this.getEvents();
  }

  initFormEventFees() {
    this.formEventFees = this.fb.group({
      fee_desc_id: ['', Validators.required],
      select: [''],
      amount: ['', Validators.compose([Validators.required, Validators.pattern('^[+-]?\\d+(\.\\d+)?')])],
      event_type_id: ['', Validators.required],
      event_id: ['', Validators.required],
      liste_membre: [[], Validators.required]
    });
  }

  get type() {
    return this.formEventFees.get('event_type_id');
  }

  get fess() {
    return this.formEventFees.get('fee_desc_id');
  }

  get amount() {
    return this.formEventFees.get('amount');
  }

  get event() {
    return this.formEventFees.get('event_id');
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

  // get the events fees type list
  getEventsFeesType() {
    this.eventService.getFeesType().subscribe(events => {
      if (events && events.fee_description) {
        this.eventsFeesTypeList = events.fee_description;
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
  getMembersList() {
    this.member.getListOfMembers().subscribe(reponse => {
      if (reponse && reponse.membres) {
        this.tempMember = reponse.membres;
        const members: Members[] = [];
        this.tempMember.forEach(member => {
          if (member.Status_Id === 2) {
            members.push({
              choice: false,
              member_id: member.member_id,
              name: member.Fname + ' ' + member.Lname
            });
          }

        });
        this.memberList = this.api.oderByAlpha(members);
        this.formEventFees.get('liste_membre').setValue(members);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Add selected member
  getSelectedMember() {
    const selectMember: Members[] = [];
    this.memberList.forEach(member => {
      if (member.choice) {
        selectMember.push(member);
      }
    });

    this.formEventFees.get('liste_membre').setValue(selectMember);
  }

   // select all the members
   selectAllMembers() {
    const members: Members[] = this.memberList;
    const tempMembers: Members[]  = [];
    members.forEach((member: any) => {
      tempMembers.push({
        choice: true,
        member_id: member.member_id,
        name:  member.name,
      });
    });
    this.memberList = tempMembers;
    this.formEventFees.get('liste_membre').setValue(tempMembers);
  }

  // Deselect all the members
  deselectAllMembers() {
    const members: Members[] = this.memberList;
    const tempMembers: Members[]  = [];
    members.forEach((member: any) => {
      tempMembers.push({
        choice: false,
        member_id: member.member_id,
        name:  member.name,
      });
    });
    this.memberList = tempMembers;
    this.formEventFees.get('liste_membre').setValue(tempMembers);
  }

  // Select/Deselect all
  onSelectOrDeselect(select: any) {
    select === 1 ? this.selectAllMembers() : this.deselectAllMembers();
  }

  // add event lateness
  addEventLateness() {
    this.loadingShow = true;
    this.spinner.show('event-paid');
    this.eventService.paidFeesEvent(this.token, this.formEventFees.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_PAY_FEES_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.eventService.sendUpdateMessage('update');
        this.initFormEventFees();
        this.getMembersList();
      }
      this.spinner.hide('event-paid');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('event-paid');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logout(this.token);
        }

        if (error.error.event_id_not_exist) {
          this.translate.get('EVENT_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.fee_desc_id_not_exist) {
          this.translate.get('EVENT_TYPE_FEES_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.member_id_not_exist) {
          this.translate.get('EVENT_PARTICIPATION_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }


}
