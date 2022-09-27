import { EventsService } from './../../../service/events.service';
import { ApiService } from 'src/app/service/api.service';
import { FamilleService } from './../../../service/famille.service';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from './../../../service/membre.service';
import { Component, OnInit } from '@angular/core';
import { RpnService } from 'src/app/service/rpn.service';

@Component({
  selector: 'app-rpn-family-transaction',
  templateUrl: './rpn-family-transaction.component.html',
  styleUrls: ['./rpn-family-transaction.component.scss']
})
export class RpnFamilyTransactionComponent implements OnInit {


  loadingShow: boolean;
  token: string;
  familyNotExist: boolean;
  rpnWallets: any;
  activerpnWallet: any;
  defaultrpnWallet: any;
  user: any;
  familyList: any;
  eventsList: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private rpn: RpnService,
    private member: MembreService,
    private error: ErrorService,
    private family: FamilleService,
    private api: ApiService,
    private event: EventsService
  ) {
    this.loadingShow = false;
    this.familyNotExist = false;
    this.rpnWallets = [];
    this.activerpnWallet = [];
    this.defaultrpnWallet = [];
    this.familyList = [];
    this.eventsList = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.rpn.getUpdateMessage().subscribe(data=>{
      if (data && data.message === 'update') {
        this.getRPNWallet();
      }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getRPNWallet();
  }

  // get the rpn member list
  getRPNWallet() {
    const family = this.family.getFamilySession();
    this.loadingShow = false;
    this.rpn.getRPNfamilyTransactions(this.token, family.famille_id).subscribe(reponse => {
      if (reponse && reponse.transactions) {
        this.loadingShow = false;
        this.defaultrpnWallet = reponse.transactions;
        this.rpnWallets = this.api.formatArrayToMatrix(this.defaultrpnWallet, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.rpnWallets.length;
        this.nbItems = this.defaultrpnWallet.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }


  // get families list
  getFamily() {
    this.family.getFamily().subscribe(families => {
      if (families && families.familles) {
        this.familyList = families.familles;
      }
    }, error => {
      this.error.manageError(error);
    });
  }


  // get  events list
  getEvents() {
    this.event.getEventType().subscribe(reponse => {
      if (reponse && reponse.events) {
        this.eventsList = reponse.events;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the family name
  getFamilyName(familleId: number) {
    return this.family.getFamilyName(familleId, this.familyList);
  }

 // Get the event name
 getEventsName(eventId: number) {
  return this.event.getEventName(eventId, this.eventsList);
}


  // Pagination function

  // get number items by page
  getNumberItems() {
    let i = 5;
    const nbItemsByPage = [];
    while (i < this.nbItems) {
      nbItemsByPage.push(i);
      i *= 2;
    }
    return nbItemsByPage;
  }

  // Update the number of pages
  updateNumberItems(nbItems: number) {
    this.nbItemsByPage = nbItems;
    this.rpnWallets = this.api.formatArrayToMatrix(this.defaultrpnWallet, this.nbItemsByPage);
    this.totalPages = this.rpnWallets.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.rpnWallets[id - 1] && this.rpnWallets[id - 1].length > 0) ?
      this.activerpnWallet = this.rpnWallets[id - 1] : this.activerpnWallet = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.rpnWallets[this.numero - 1] && this.rpnWallets[this.numero - 1].length > 0) ?
        this.activerpnWallet = this.rpnWallets[this.numero - 1] : this.activerpnWallet = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.rpnWallets.length ? this.numero = position : this.numero = currentId;
      (this.rpnWallets[this.numero - 1] && this.rpnWallets[this.numero - 1].length > 0) ?
        this.activerpnWallet = this.rpnWallets[this.numero - 1] : this.activerpnWallet = [];
      this.currentPage = this.numero;
    }
  }


}
