import { Component, OnInit } from '@angular/core';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { ApiService } from 'src/app/service/api.service';
import { WalletService } from 'src/app/service/wallet.service';
import { DebitWalletComponent } from '../debit-wallet/debit-wallet.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {


  loadingShow: boolean;
  token: string;
  rpnWallets: any;
  activerpnWallet: any;
  defaultrpnWallet: any;
  user: any;
  searchTerm: any;
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  total_families: number;
  total_members:number;
  total_balance: number;

  constructor(
    private member: MembreService,
    private error: ErrorService,
    private api: ApiService,
    private wallet: WalletService,
    private modalService: NgbModal
  ) {
    this.searchTerm = '';
    this.loadingShow = false;
    this.rpnWallets = [];
    this.activerpnWallet = [];
    this.defaultrpnWallet = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.wallet.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update'){
        this.getWalletTransaction();
      }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getWalletTransaction();
  }

  // Filter by name
  filterByKeyword(keyword: string) {
    let resultFilter = [];
    let words = '';
    let key = '';
    this.defaultrpnWallet.forEach(member => {
      if (member) {
        words = member.infos_membre.Fname + '' + member.infos_membre.Lname;
        words = words.toLowerCase();
        key = keyword.trim().toLowerCase();
        if (words.match(key)) {
          resultFilter.push(member);
        }
      }
    });
    this.rpnWallets = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.updateActiveList(1);
    this.totalPages = this.rpnWallets.length;
    this.nbItems = resultFilter.length;
    
  }

  // get the rpn member list
  getWalletTransaction() {
    this.loadingShow = true;
    this.wallet.getMemberWalletSolde(this.token).subscribe(reponse => {
      if (reponse && reponse.statistique) {
        this.loadingShow = false;
        this.defaultrpnWallet = reponse.statistique;
        this.total_families = reponse.total_famille;
        this.total_members = reponse.total_membre_actif;
        this.total_balance = reponse.total_solde;
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

      // debit member wallet
      debitRPNMember(trans: any) {
        this.wallet.setMemberData(trans)
        this.modalService.open(DebitWalletComponent, { centered: true , size : 'lg' });
      }

}
