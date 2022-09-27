import { ActivatedRoute } from '@angular/router';
import { WalletService } from './../../../service/wallet.service';
import { ApiService } from 'src/app/service/api.service';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from './../../../service/membre.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-member-transaction',
  templateUrl: './member-transaction.component.html',
  styleUrls: ['./member-transaction.component.scss']
})
export class MemberTransactionComponent implements OnInit {


  loadingShow: boolean;
  token: string;
  familyNotExist: boolean;
  rpnWallets: any;
  activerpnWallet: any;
  defaultrpnWallet: any;
  user: any;
  familyList: any;
  eventsList: any;
  memberId: any;
  searchTerm: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private member: MembreService,
    private error: ErrorService,
    private api: ApiService,
    private wallet: WalletService,
    private activeRoute: ActivatedRoute
  ) {
    this.searchTerm = '';
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
    this.wallet.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getMemberWalletTransaction();
      }
    });
  }

  ngOnInit() {
    this.memberId = this.activeRoute.snapshot.params.memberId;
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getMemberWalletTransaction();
  }

  // Filter by name
  filterByKeyword(keyword: string) {
    const resultFilter = [];
    let words = '';
    let key = '';
    this.defaultrpnWallet.forEach(member => {
      if (member) {
        words = member.Fname + '' + member.Lname;
        words = words.toLowerCase();
        key = keyword.trim().toLowerCase();
        if (words.match(key)) {
          resultFilter.push(member);
        }
      }
    });
    this.rpnWallets = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.rpnWallets.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

  // get the rpn member list
  getMemberWalletTransaction() {
    this.loadingShow = false;
    this.wallet.getMemberWalletTransaction(this.token, this.memberId).subscribe(reponse => {
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
