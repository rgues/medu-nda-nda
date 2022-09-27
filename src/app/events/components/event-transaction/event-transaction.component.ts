import { UpdateEventTransactionComponent } from './../update-event-transaction/update-event-transaction.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { WalletService } from './../../../service/wallet.service';
import { EventsService } from './../../../service/events.service';
import { ApiService } from 'src/app/service/api.service';
import { FamilleService } from './../../../service/famille.service';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from './../../../service/membre.service';
import { Component, OnInit } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'app-event-transaction',
  templateUrl: './event-transaction.component.html',
  styleUrls: ['./event-transaction.component.scss']
})
export class EventTransactionComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  eventsTransactions: any;
  activeeventsTransactions: any;
  defaulteventsTransactions: any;
  user: any;


  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  eventId: number;

  constructor(
    private wallet: WalletService,
    private member: MembreService,
    private error: ErrorService,
    private api: ApiService,
    private event: EventsService,
    private ActiveRoute: ActivatedRoute,
    private modalService: NgbModal
  ) {
    this.loadingShow = false;
    this.eventsTransactions = [];
    this.activeeventsTransactions = [];
    this.defaulteventsTransactions = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.eventId = this.ActiveRoute.snapshot.params.eventId;
    this.wallet.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getEventTransactions();
      }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getEventTransactions();
  }

  // get the rpn member list
  getEventTransactions() {
    this.loadingShow = false;
    this.wallet.memberWalletEventTransaction(this.token, this.eventId).subscribe(reponse => {
      if (reponse && reponse.transactions) {
        this.loadingShow = false;
        this.defaulteventsTransactions = reponse.transactions;
        this.eventsTransactions = this.api.formatArrayToMatrix(this.defaulteventsTransactions, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.eventsTransactions.length;
        this.nbItems = this.defaulteventsTransactions.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }


  // Edit the amount of the transaction
  editAmount(amount: any) {
    this.wallet.sendTransactionData(amount);
    this.modalService.open(UpdateEventTransactionComponent, { centered: true });
  }



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
    this.eventsTransactions = this.api.formatArrayToMatrix(this.defaulteventsTransactions, this.nbItemsByPage);
    this.totalPages = this.eventsTransactions.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.eventsTransactions[id - 1] && this.eventsTransactions[id - 1].length > 0) ?
      this.activeeventsTransactions = this.eventsTransactions[id - 1] : this.activeeventsTransactions = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.eventsTransactions[this.numero - 1] && this.eventsTransactions[this.numero - 1].length > 0) ?
        this.activeeventsTransactions = this.eventsTransactions[this.numero - 1] : this.activeeventsTransactions = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.eventsTransactions.length ? this.numero = position : this.numero = currentId;
      (this.eventsTransactions[this.numero - 1] && this.eventsTransactions[this.numero - 1].length > 0) ?
        this.activeeventsTransactions = this.eventsTransactions[this.numero - 1] : this.activeeventsTransactions = [];
      this.currentPage = this.numero;
    }
  }

}
