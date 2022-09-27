import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { WalletService } from './../../../service/wallet.service';
import { EventsService } from './../../../service/events.service';
import { ApiService } from 'src/app/service/api.service';
import { FamilleService } from './../../../service/famille.service';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from './../../../service/membre.service';
import { RpnService } from './../../../service/rpn.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'app-wallet-transaction',
  templateUrl: './wallet-transaction.component.html',
  styleUrls: ['./wallet-transaction.component.scss']
})
export class WalletTransactionComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  familyNotExist: boolean;
  rpnWallets: any;
  activerpnWallet: any;
  defaultrpnWallet: any;
  user: any;
  familyList: any;
  eventsList: any;
  searchTerm: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  memberId: number;
  year:any;
  listMembers: any;
  yearList: any;

  constructor(
    private rpn: RpnService,
    private member: MembreService,
    private modalService: NgbModal,
    private error: ErrorService,
    private family: FamilleService,
    private api: ApiService,
    private event: EventsService,
    private wallet: WalletService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private toast: ToastrService
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
    this.memberId = -1;
    this.year = -1;
    this.wallet.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update'){
        this.getWalletTransaction();
      }
    });
    this.listMembers = [];
    this.yearList = [];
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getWalletTransaction();
    this.getMembers();
    this.getDates();
  }

 

  // Filter by name
  filterByKeyword(keyword: string) {
    let resultFilter = [];
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
    resultFilter = this.api.oderByTransactionDate(resultFilter);
    this.rpnWallets = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.rpnWallets.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

    // Get the list of members
    getMembers() {
      this.member.getListOfMembers().subscribe(members => {
        const actifMembers = [];
        members.membres.forEach(memb => {
          if (memb.Status_Id === 2) {
            actifMembers.push(memb);
          } 
        });
        this.listMembers = this.api.oderByFirstname(actifMembers);
      }, error => {
        this.error.manageError(error);
      });
    }

    // Get the list of date
    getDates() {
      this.yearList = [];
      const currentYear = new Date().getFullYear();
      for (let i=0; i < 10; i++) {
        this.yearList.push(currentYear - i);
      }
    }

    // research the list of members that match City or Profession
    researchTransaction() {
      this.loadingShow = true;
      const transactions = [];
      this.defaultrpnWallet.forEach(trans => {
          const currentYear = trans.transaction_date ? new Date(trans.transaction_date).getFullYear() : -1;
          if (trans && (trans.member_id === this.memberId && currentYear === this.year) ||
           (trans.member_id === this.memberId && this.year === -1) ||  (currentYear === this.year && this.memberId === -1)) {
            transactions.push(trans);
          }
      });
        this.rpnWallets = this.api.formatArrayToMatrix(transactions, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.rpnWallets.length;
        this.nbItems = transactions.length;
        setTimeout(()=> {
          this.loadingShow = false;
        }, 200);
    }

  // get the rpn member list
  getWalletTransaction() {
    this.loadingShow = true;
    this.wallet.getAllMembersWalletTransaction(this.token).subscribe(reponse => {
      if (reponse && reponse.transactions) {
        this.loadingShow = false;
        this.defaultrpnWallet = reponse.transactions;
        this.defaultrpnWallet = this.api.oderByTransactionDate(this.defaultrpnWallet);
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


  // Delete a transaction
  deleteTransaction(trans: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {
    this.loadingShow = true;
    this.spinner.show('delete-trans');
    const member = this.member.getUserSession();
    const param = {
      transaction_id: trans.id
    };

    this.wallet.deleteMemberWalletTransaction(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('TRANS_DELETE_SUCCESS_MESSAGE').subscribe(transa => {
          this.toast.success(transa);
        });
        this.activerpnWallet.splice(index, 1);
        this.getWalletTransaction();
      }
      this.spinner.hide('delete-trans');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-trans');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.transaction_id_not_exist) {
          this.translate.get('TRANS_NOT_EXIST').subscribe(transa => {
            this.toast.error(transa);
          });
        }

        if (error.error.invalid_token) {
            this.member.logoutMember();
        }

      } else {
        this.error.manageError(error);
      }
    });
  }
    });
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
