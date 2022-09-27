import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/service/api.service';
import { EventsService } from './../../../service/events.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import { Router } from '@angular/router';

interface Members {
  choice: boolean;
  name: string;
  member_id: number;
  attend: number;
}

@Component({
  selector: 'app-add-event-attendance',
  templateUrl: './add-event-attendance.component.html',
  styleUrls: ['./add-event-attendance.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddEventAttendanceComponent implements OnInit {

  formEventAttendance: FormGroup;
  loadingShow: boolean;
  memberList: Members[];
  tempMember: any;
  token: string;
  startDateSelect: Date;
  eventsList: any;
  eventsTypeList: any;
  eventsTypeListFilter: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private eventService: EventsService,
    private translate: TranslateService,
    private router: Router,
    private api: ApiService
  ) {
    this.memberList = [];
    this.tempMember = [];
    this.startDateSelect = new Date();
    this.eventsList = [];
    this.eventsTypeList = [];
    this.eventsTypeListFilter = [];
  }

  ngOnInit() {
    this.initFormEventAttendance();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getEventsType();
    this.getMembersList();
    this.getEvents();
  }

  initFormEventAttendance() {
    this.formEventAttendance = this.fb.group({
      event_type_id: ['', Validators.required],
      select: [''],
      event_id: ['', Validators.required],
      liste_membre: [[], Validators.required]
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

  // get the  member list
  getMembersList() {
    this.member.getListOfMembers().subscribe(reponse => {
      if (reponse && reponse.membres) {
        this.tempMember = reponse.membres;
        const members: Members[] = [];
        this.tempMember.forEach(member => {
          if (member.Status_Id <= 2) {
            members.push({
              choice: true,
              member_id: member.member_id,
              name:  member.Fname + ' ' +  member.Lname,
              attend: 1
            });
          }
     
        });
        this.memberList = this.api.oderByAlpha(members);
        this.formEventAttendance.get('liste_membre').setValue(members);
      }
    }, error => {
      this.error.manageError(error);
    });
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
        attend: 1
      });
    });
    this.memberList = tempMembers;
    this.formEventAttendance.get('liste_membre').setValue(tempMembers);
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
        attend: 1
      });
    });
    this.memberList = tempMembers;
    this.formEventAttendance.get('liste_membre').setValue(tempMembers);
  }

  // Select/Deselect all
  onSelectOrDeselect(select: any) {
    select === 1 ? this.selectAllMembers() : this.deselectAllMembers();
  }

  // Add selected member
  getSelectedMember() {
    const selectMember: Members[] = [];
    this.memberList.forEach(member => {
      if (member.choice) {
        selectMember.push(member);
        selectMember[this.memberList.indexOf(member)].attend = 1;
      } else {
        selectMember.push(member);
        selectMember[this.memberList.indexOf(member)].attend = 0;
      }
    });

    this.formEventAttendance.get('liste_membre').setValue(selectMember);
  }

  // add event attendance
  addEventAttendance() {
    this.loadingShow = true;
    this.spinner.show('event-attendance');
    this.eventService.saveMemberAttendance(this.token, this.formEventAttendance.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('EVENT_PARTICIPATION_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormEventAttendance();
        this.getMembersList();

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
          this.translate.get('EVENT_PARTICIPATION_EVENT_NOT_EXIST').subscribe(trans => {
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
