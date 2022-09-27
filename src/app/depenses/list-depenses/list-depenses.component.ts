import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { DepensesService } from 'src/app/service/depenses.service';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { AddDepensesComponent } from '../add-depenses/add-depenses.component';
import { UpdateDepensesComponent } from '../update-depenses/update-depenses.component';

@Component({
  selector: 'app-list-depenses',
  templateUrl: './list-depenses.component.html',
  styleUrls: ['./list-depenses.component.scss']
})
export class ListDepensesComponent implements OnInit {
  listData: any;
  defaultListData: any;
  lang: string;
  loadingShow: boolean;
  user: any;
  searchTerm: any;
  statut: string;

  // Pagination data
  activelistData: any;
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  statusFilterId: number;
  statusList: any;

  constructor(
    private api: ApiService,
    private member: MembreService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private depense: DepensesService,
    private modalService: NgbModal
  ) {
    this.listData = [];
    this.searchTerm = '';
    this.defaultListData = [];
    this.activelistData = [];
    const lang = localStorage.getItem('langue');
    lang ? this.lang = lang : this.lang = 'fr';
    this.loadingShow = false;
    this.statusFilterId = -1;
    this.statusList = [];
    this.statut = '';

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    // Listen to message and update the list
    this.depense.getMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getExpenses(this.user.remenber_token);
      }
    });
  }

  ngOnInit() {
    this.user = this.member.getUserSession();
    this.getExpenses(this.user.remenber_token);
    this.getStatus(this.user.remenber_token);
  }

  // who can make action
  isAutorized() {
    if (this.user && this.user.executive_id === 1 || this.user.executive_id === 10) {
      return true;
    } else {
      return false;
    }
  }

  // Get the list of status
  getStatus(token: string) {
    this.depense.getAllSpentType(token).subscribe(data => {
      if (data && data.spending_type) {
        this.statusList = data.spending_type;
      }
    }, error => {
      this.errorService.manageError(error);
    });
  }

  // Get the type name
  getTypeName(typeId: number) {
    let type = [], typeName = '';
    if (this.statusList && this.statusList.length > 0) {
      type = this.statusList.filter(data => {
        return data.id === typeId
      });
      typeName = type && type.length ? type[0].type : ''
    }
    return typeName;
  }


  // Filter by name
  filterByKeyword(keyword: string) {
    const resultFilter = [];
    let words = '';
    let key = '';
    this.defaultListData.forEach(data => {
      if (data) {
        words = data.infos_membre.firstname + '' + data.infos_membre.lastname;
        words = words.toLowerCase();
        key = keyword.trim().toLowerCase();
        if (words.match(key)) {
          resultFilter.push(data);
        }
      }
    });
    this.listData = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.listData.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

  // Filter by role
  filterStatut(satutId: number) {
    const resultFilter = [];
    this.defaultListData.forEach(member => {
      if (member && member.infos_spent.spending_type_id === satutId || satutId === -1) {
        resultFilter.push(member);
      }
    });
    this.listData = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.listData.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

  // Get the list expenses
  getExpenses(token: string) {
    this.loadingShow = true;
    this.depense.getAllSpents(token).subscribe(data => {
      this.loadingShow = false;
      this.defaultListData = data.liste_spending;
      this.listData = this.api.formatArrayToMatrix(this.defaultListData, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages = this.listData.length;
      this.nbItems = this.defaultListData.length;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
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
    this.listData = this.api.formatArrayToMatrix(this.defaultListData, this.nbItemsByPage);
    this.totalPages = this.listData.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listData[id - 1] && this.listData[id - 1].length > 0) ?
      this.activelistData = this.listData[id - 1] : this.activelistData = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listData[this.numero - 1] && this.listData[this.numero - 1].length > 0) ?
        this.activelistData = this.listData[this.numero - 1] : this.activelistData = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listData.length ? this.numero = position : this.numero = currentId;
      (this.listData[this.numero - 1] && this.listData[this.numero - 1].length > 0) ?
        this.activelistData = this.listData[this.numero - 1] : this.activelistData = [];
      this.currentPage = this.numero;
    }
  }

  // update Statut
  updateExpenses(data: any) {
    this.depense.setDepenseSession(data);
    this.modalService.open(UpdateDepensesComponent, { centered: true });
  }

  // update Statut
  addExpenses() {
    this.modalService.open(AddDepensesComponent, { centered: true });
  }

  // Delete a expense
  deleteExpense(trans: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {
        this.loadingShow = true;
        this.spinner.show('delete-action');
        const member = this.member.getUserSession();
        const param = {
          spending_id: trans.infos_spent.id
        };
        this.depense.deleteSpent(member.remenber_token, param).subscribe(reponse => {
          if (reponse && reponse.message === 'success') {
            this.loadingShow = false;
            this.translate.get('EXPENSES_DELETE_SUCCESS_MESSAGE').subscribe(transa => {
              this.toast.success(transa);
            });
            this.activelistData.splice(index, 1);
            this.getExpenses(this.user.remenber_token);
          }
          this.spinner.hide('delete-action');
        }, error => {
          this.loadingShow = false;
          this.spinner.hide('delete-action');
          if (error && error.error && error.error.message === 'error') {
            if (error.error.spending_id_not_exist) {
              this.translate.get('EXPENSES_NOT_EXIST').subscribe(transa => {
                this.toast.error(transa);
              });
            }
            if (error.error.invalid_token) {
              this.member.logoutMember();
            }
          } else {
            this.errorService.manageError(error);
          }
        });
      }
    });
  }

}
