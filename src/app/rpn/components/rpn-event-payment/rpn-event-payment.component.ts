import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/service/api.service';
import { EventsService } from './../../../service/events.service';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RpnService } from 'src/app/service/rpn.service';
import { slideInLeft } from 'src/app/animations';

interface Members {
  choice: boolean;
  family_member_name: string;
  buy_with_cash: number;
  buy_with_rpn_wallet: number;
}

interface MembersList {
  family_id: number;
  membres: Members[];
}

@Component({
  selector: 'app-rpn-event-payment',
  templateUrl: './rpn-event-payment.component.html',
  styleUrls: ['./rpn-event-payment.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class RpnEventPaymentComponent implements OnInit {
  formRpnEventPayment: FormGroup;
  loadingShow: boolean;
  alreadyFmailyMember: boolean;
  memberList: MembersList[];
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
    private family: FamilleService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private translate: TranslateService,
    private rpn: RpnService,
    private eventService: EventsService,
    private api: ApiService
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
    this.initFormRPNpayment();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    this.getEvents();
    this.getEventsType();
    this.getFamily();
    this.getRPNMembers();
  }

  initFormRPNpayment() {
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

  // get the family list
  getFamily() {
    this.family.getFamily().subscribe(families => {
      if (families && families.familles) {
        this.familyList = this.api.oderByFamilyName(families.familles);
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

  filtersEvents(typeId: number) {
    const eventsType = [];
    this.eventsList.forEach(event => {
      if (event.event_type_id === typeId) {
        eventsType.push(event);
      }
    });
    this.eventsTypeListFilter = eventsType;
  }

  // Get the family name
  getFamilyName(familleId: number) {
    return this.family.getFamilyName(familleId, this.familyList);
  }

  // get the rpn member list
  getRPNMembers() {
    this.rpn.getRPNMembers(this.token).subscribe(reponse => {
      if (reponse && reponse.members_rpn) {
        this.tempMember = reponse.members_rpn;
        let position = 0;
        while (position < this.tempMember.length) {
          const members = [];
          this.tempMember.forEach(member => {
            if (this.tempMember[position].family_id === member.family_id) {
              members.push({ choice: false, family_member_name: member.family_member_name, buy_with_cash: 0, buy_with_rpn_wallet: 1 });
            }
          });
          if (this.notOccurrence(this.memberList, this.tempMember[position].family_id)) {
            this.memberList.push({ family_id: this.tempMember[position].family_id, membres: members });
          }
          position++;
        }
        this.memberList = this.oderBySize(this.memberList);
        this.formRpnEventPayment.get('liste_membres').setValue(this.memberList);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Not in
  notOccurrence(memberData: any, idFamily: number) {
    let found = true;
    memberData.forEach(member => {
      if (String(member.family_id) === String(idFamily)) {
        found = false;
      }
    });
    return found;
  }

  // Order by size
  oderBySize(memberList: MembersList[]) {
      if (memberList && memberList.length > 0) {
        let i = 0;
        let pivot = 0 ;
        let temp: MembersList;
        while (i < memberList.length) {
            pivot = i;
            for (let j = i + 1; j < memberList.length; j++) {
                  if (memberList[i].membres.length < memberList[j].membres.length) {
                     pivot = j;
                     temp = memberList[pivot];
                     memberList[pivot] = memberList[i];
                     memberList[i] = temp;
                  }
            }
            i++;
        }

      } else {
        return [];
      }
      return memberList;
  }

  // Add selected member
  getSelectedMember() {
    const selectMember: MembersList[] = [];
    this.memberList.forEach(member => {
      selectMember.push({ family_id: member.family_id, membres: [] });
      if (member && member.membres.length > 0) {
        let index = 0;
        member.membres.forEach(curentMember => {
          if (curentMember.choice) {
            selectMember[this.memberList.indexOf(member)].membres.push(curentMember);
            selectMember[this.memberList.indexOf(member)].membres[index].buy_with_cash = 1;
            selectMember[this.memberList.indexOf(member)].membres[index].buy_with_rpn_wallet = 0;
          } else {
            selectMember[this.memberList.indexOf(member)].membres.push(curentMember);
            selectMember[this.memberList.indexOf(member)].membres[index].buy_with_cash = 0;
            selectMember[this.memberList.indexOf(member)].membres[index].buy_with_rpn_wallet = 1;
          }
          index++;
        });
      }
    });
    this.formRpnEventPayment.get('liste_membres').setValue(selectMember);
  }


  // Paid rpn event
  payRpnEvent() {
    this.loadingShow = true;
    this.spinner.show('pay-rpn');
    this.formRpnEventPayment.get('date').setValue(this.api.formatDateTiret(this.formRpnEventPayment.value.date));
    this.rpn.payForRPNevent(this.token, this.formRpnEventPayment.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('RPN_EVENT_PAID').subscribe(trans => {
          this.toast.success(trans);
        });
        this.rpn.sendUpdateMessage('update');
        this.initFormRPNpayment();
      }
      this.spinner.hide('pay-rpn');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('pay-rpn');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.family_id_not_exist) {
          this.translate.get('FAMILY_TEXT', 'FAMILY_TEXT_NOT_EXIST').subscribe(trans => {
            this.toast.error(`${trans.FAMILY_TEXT} ${trans.FAMILY_TEXT_NOT_EXIST}`);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }


}
