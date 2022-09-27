import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { MembreService } from 'src/app/service/membre.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from 'src/app/service/error.service';
import { EventsService } from 'src/app/service/events.service';
import { ApiService } from 'src/app/service/api.service';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-member-attendace',
  templateUrl: './member-attendace.component.html',
  styleUrls: ['./member-attendace.component.scss'],
  animations: [slideInLeft]
})
export class MemberAttendaceComponent implements OnInit {

  formEventAttendance: FormGroup;
  loadingShow: boolean;
  memberList: any[];
  tempMember: any;
  token: string;
  startDateSelect: Date;
  eventsList: any;
  eventsTypeList: any;
  eventsTypeListFilter: any;
  eventData: any;
  eventId: number;
  loading: boolean;

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
    this.eventData = this.eventService.getEventSession();
    this.loading = false;
  }

  ngOnInit() {
    this.initFormEventAttendance();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getEventsType();
    this.getEvents();
  }

  initFormEventAttendance() {
    this.formEventAttendance = this.fb.group({
      event_type_id: ['', Validators.required],
      event_id: ['', Validators.required],
      members: [[], Validators.required]
    });
  }

  get type() {
    return this.formEventAttendance.get('event_type_id');
  }


  get event() {
    return this.formEventAttendance.get('event_id');
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

  // get the designated member list
  getMembersDesignated(eventId: number) {
    this.loading = true;
    const param = {
      event_id : eventId
    };
    this.member.getMemberDesignated(this.token, param).subscribe(reponse => {
      this.loading = false;
      if (reponse && reponse.members) {
        this.tempMember = reponse.members;
        const members: any[] = [];
        this.tempMember.forEach(member => {
          members.push({
            choice: member.attendance === 1 ? true : false,
            member_id: member.member_id,
            name: member.Fname + ' ' + member.Lname,
            attend: member.attendance
          });
        });
        this.memberList = this.api.oderByAlpha(members);
      }
    }, error => {
      this.loading = false;
      this.error.manageError(error);
    });
  }

  // Add selected member
  getSelectedMember() {
    const selectMember: any[] = [];
    this.memberList.forEach(member => {
      if (member.choice) {
        selectMember.push(member);
        selectMember[this.memberList.indexOf(member)].attend = 1;
      } else {
        selectMember.push(member);
        selectMember[this.memberList.indexOf(member)].attend = 0;
      }
    });
    this.formEventAttendance.get('members').setValue(selectMember);
  }

  // Save the event attendance
  saveEventAttendance() {
    this.loadingShow = true;
    this.spinner.show('event-attendance');
    this.member.saveMemberAttendance(this.token, this.formEventAttendance.value).subscribe(reponse => {
      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_ATTENDANCE_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormEventAttendance();
      }
      this.spinner.hide('event-attendance');
    }, error => {
      this.loadingShow = false;
      this.spinner.hide('event-attendance');
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
