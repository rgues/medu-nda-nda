import { Component, OnInit } from '@angular/core';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from 'src/app/service/api.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from 'src/app/service/error.service';
import { EventsService } from 'src/app/service/events.service';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-assign-reception',
  templateUrl: './assign-reception.component.html',
  styleUrls: ['./assign-reception.component.scss'],
  animations : [
    slideInLeft
  ]
})
export class AssignReceptionComponent implements OnInit {

  formMemberReception: FormGroup;
  loadingShow: boolean;
  memberList: any[];
  tempMembers: any;
  token: string;
  startDateSelect: Date;
  eventsList: any;
  eventsTypeList: any;
  eventsTypeListFilter: any;
  loading: boolean;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private eventService: EventsService,
    private memberService: MembreService,
    private api: ApiService,
    private router: Router
  ) {
    this.memberList = [];
    this.tempMembers = [];
    this.startDateSelect = new Date();
    this.eventsList = [];
    this.eventsTypeList = [];
    this.eventsTypeListFilter = [];
    this.loading = false;
  }

  ngOnInit() {
    this.initFormMemberReception();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getEventsType();
    this.getEvents();
    this.getMemberList();
  }

  initFormMemberReception() {
    this.formMemberReception = this.fb.group({
      event_type_id: ['', Validators.required],
      event_id: ['', Validators.required],
      members: [[], Validators.required]
    });
  }

  get type() {
    return this.formMemberReception.get('event_type_id');
  }

  get event() {
    return this.formMemberReception.get('event_id');
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
  getMemberList() {
    this.loading = true;
    this.memberService.getMemberCanReceive(this.token).subscribe(reponse => {
      this.loading = false;
      if (reponse && reponse.membres_n_ayant_pas_ete_designe) {
        this.tempMembers = reponse.membres_n_ayant_pas_ete_designe;
        const members: any[] = [];
        this.tempMembers.forEach(member => {
          members.push({
            choice: false,
            member_id: member.member_id,
            name: member.Fname + ' ' + member.Lname
          });
        });
        this.memberList = this.api.oderByAlpha(members);
      }
    }, error => {
      this.loading = false;
      this.error.manageError(error);
    });
  }

  // get the member name
  getMemberName(memberId: number) {
      let memberName = '';
    this.tempMembers.forEach(member => {
      if (member && member.member_id === memberId) {
        memberName =  member.Fname + ' ' + member.Lname;
      }
    });

    return memberName;

  }
  // Add selected family
  getSelectedMembers() {
    const getSelectedMember: any[] = [];
    this.memberList.forEach(member => {
      if (member.choice) {
        getSelectedMember.push(member);
      }
    });
    this.formMemberReception.get('members').setValue(getSelectedMember);
  }

  // add family reception
  assignMenberReception() {
    this.loadingShow = true;
    this.spinner.show('member-recpetion');
    this.member.asignMemberReception(this.token, this.formMemberReception.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('MEMBER_RECEPTION_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormMemberReception();
        this.getMemberList();
      }
      this.spinner.hide('member-recpetion');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('member-recpetion');
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
          this.translate.get(['EVENT_PARTICIPATION_MEMBER_NOT_EXIST']).subscribe(trans => {
            this.toast.error(`${trans.EVENT_PARTICIPATION_MEMBER_NOT_EXIST}`);
          });  
        }
        if (error.error.member_id_a_deja_ete_designe) {
          this.translate.get(['MEMBER_ALREADY_DESIGNATED']).subscribe(trans => {
            this.toast.error(`${this.getMemberName(error.error.member_id)} ${trans.MEMBER_ALREADY_DESIGNATED}`);
          });
        }
      } else {
        this.error.manageError(error);
      }
    });
  }
}
