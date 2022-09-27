import { TranslateService } from '@ngx-translate/core';
import { WalletService } from './../../../service/wallet.service';
import { ApiService } from 'src/app/service/api.service';
import { EventsService } from './../../../service/events.service';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';

interface Members {
  choice: boolean;
  name: string;
  member_id: number;
  buy_with_cash: number;
  buy_with_rpn_wallet: number;
}

@Component({
  selector: 'app-member-event-payment',
  templateUrl: './member-event-payment.component.html',
  styleUrls: ['./member-event-payment.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class MemberEventPaymentComponent implements OnInit {
  formRpnEventPayment: FormGroup;
  loadingShow: boolean;
  alreadyFmailyMember: boolean;
  memberList: Members[];
  tempMember: any;
  familyList: any;
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
    private api: ApiService,
    private wallet: WalletService
  ) {
    this.alreadyFmailyMember = false;
    this.memberList = [];
    this.familyList = [];
    this.tempMember = [];
    this.startDateSelect = new Date();
    this.eventsList = [];
    this.eventsTypeList = [];
    this.eventsTypeListFilter = [];
  }

  ngOnInit() {
    this.initFormPayment();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getEventsType();
    this.getMembersList();
    this.getEvents();
  }

  initFormPayment() {
    this.formRpnEventPayment = this.fb.group({
      date: [this.startDateSelect, Validators.required],
      event_type_id: ['', Validators.required],
      event_id: ['', Validators.required],
      montant_par_membre: ['', Validators.compose([Validators.pattern('^[+-]?\\d+(\.\\d+)?'), Validators.required])],
      liste_membres: [[], Validators.required]
    });
  }

  get type() {
    return this.formRpnEventPayment.get('event_type_id');
  }

  get dateError() {
    return this.formRpnEventPayment.get('date');
  }

  get event() {
    return this.formRpnEventPayment.get('event_id');
  }


  get montant() {
    return this.formRpnEventPayment.get('montant_par_membre');
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
              name:   member.Fname + ' ' + member.Lname,
              buy_with_cash: 0,
              buy_with_rpn_wallet: 1
            });
          }
       
        });
        this.memberList = this.api.oderByAlpha(members);
        this.formRpnEventPayment.get('liste_membres').setValue(members);
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
        selectMember[this.memberList.indexOf(member)].buy_with_cash = 1;
        selectMember[this.memberList.indexOf(member)].buy_with_rpn_wallet = 0;
      } else {
        selectMember.push(member);
        selectMember[this.memberList.indexOf(member)].buy_with_cash = 0;
        selectMember[this.memberList.indexOf(member)].buy_with_rpn_wallet = 1;
      }
    });

    this.formRpnEventPayment.get('liste_membres').setValue(selectMember);
  }

  // Paid rpn event
  paidEvent() {
    this.loadingShow = true;
    this.spinner.show('pay-event');
    this.formRpnEventPayment.get('date').setValue(this.api.formatDateTiret(this.formRpnEventPayment.value.date));
    this.wallet.paidMembersEvent(this.token, this.formRpnEventPayment.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('RPN_EVENT_PAID').subscribe(trans => {
          this.toast.success(trans);
        });
        this.wallet.sendUpdateMessage('update');
        this.initFormPayment();
        this.getMembersList();
      }
      this.spinner.hide('pay-event');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('pay-event');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logout(this.token);
        }

        if (error.error.event_id_not_exist) {
          this.translate.get('EVENT_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }


}
