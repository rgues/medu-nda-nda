import { TranslateService } from '@ngx-translate/core';
import { ModalAdminComponent } from './../modal-admin/modal-admin.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-list-member',
  templateUrl: './list-member.component.html',
  styleUrls: ['./list-member.component.scss']
})
export class ListMemberComponent implements OnInit {
  listMembers: any;
  defaultListMembers: any;
  lang: string;
  loadingShow: boolean;
  user: any;
  searchTerm: any;
  statut: string;

  // Pagination data
  activelistMembers: any;
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  statusFilterId: number;
  statusList: any;
  tableData: any;
  translations: string[];
  printList: any[];

  constructor(
    private api: ApiService,
    private member: MembreService,
    private errorService: ErrorService,
    private router: Router,
    private translate: TranslateService,
    private modalService: NgbModal
  ) {
    this.listMembers = [];
    this.searchTerm = '';
    this.defaultListMembers = [];
    this.activelistMembers = [];
    const lang = localStorage.getItem('langue');
    lang ? this.lang = lang : this.lang = 'fr';
    this.loadingShow = false;
    this.statusFilterId = -1;
    this.statusList = [];
    this.statut = '';
    this.translations = [];
    this.printList = [];

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    // Listen to message and update the list
    this.member.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getMembers();
      }
    });
  }

  ngOnInit() {
    this.getMembers();
    this.user = this.member.getUserSession();
    this.getStatus();
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
  getStatus() {
    this.member.getStatut().subscribe(status => {
      if (status && status.status) {
        this.statusList = status.status;
      }
    }, error => {
      this.errorService.manageError(error);
    });
  }




  // show member Transaction
  showTransaction(memberId: any) {
    this.router.navigateByUrl('/admin/transaction-member/' + memberId);
  }

  // add doc 
  addDoc(member) {
    this.router.navigate(['/member-doc/list-docs',member.member_id ]);
  }

  walletMember() {
    this.router.navigate(['/wallet']);
  }

  // Filter by name
  filterByKeyword(keyword: string) {
    const resultFilter = [];
    let words = '';
    let key = '';
    this.defaultListMembers.forEach(member => {
      if (member) {
        words = member.Fname + '' + member.Lname;
        words = words.toLowerCase();
        key = keyword.trim().toLowerCase();
        if (words.match(key)) {
          resultFilter.push(member);
        }
      }
    });
    this.printList = resultFilter;
    this.listMembers = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.listMembers.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

    // Filter by role
    filterStatut(satutId: number) {
      const resultFilter = [];
      this.defaultListMembers.forEach(member => {
        if (member && member.Status_Id === satutId || satutId === -1) {
            resultFilter.push(member);
        }
      });
      this.printList = resultFilter;
      this.listMembers = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
      this.totalPages = this.listMembers.length;
      this.nbItems = resultFilter.length;
      this.updateActiveList(1);
    }

  // Get la liste des membres
  getMembers() {
    this.loadingShow = true;
    this.member.getListOfMembers().subscribe(members => {
      this.loadingShow = false;
      const actifMembers = [];
      const inactifMembers = [];
      let listMembers = [];
      members.membres.forEach(memb => {
        if (memb.Status_Id === 2) {
          actifMembers.push(memb);
        } else {
          inactifMembers.push(memb);
        }
      });
      listMembers = actifMembers.concat(inactifMembers);
      this.defaultListMembers = listMembers;
      this.printList = listMembers;
      this.listMembers = this.api.formatArrayToMatrix(this.defaultListMembers, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages = this.listMembers.length;
      this.nbItems = this.defaultListMembers.length;
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
    this.listMembers = this.api.formatArrayToMatrix(this.defaultListMembers, this.nbItemsByPage);
    this.totalPages = this.listMembers.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listMembers[id - 1] && this.listMembers[id - 1].length > 0) ?
      this.activelistMembers = this.listMembers[id - 1] : this.activelistMembers = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listMembers[this.numero - 1] && this.listMembers[this.numero - 1].length > 0) ?
        this.activelistMembers = this.listMembers[this.numero - 1] : this.activelistMembers = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listMembers.length ? this.numero = position : this.numero = currentId;
      (this.listMembers[this.numero - 1] && this.listMembers[this.numero - 1].length > 0) ?
        this.activelistMembers = this.listMembers[this.numero - 1] : this.activelistMembers = [];
      this.currentPage = this.numero;
    }
  }

  // Update a member
  updateMember(memberId: number) {
    this.router.navigateByUrl(`/admin/update-member/${memberId}`);
  }

  // update Statut
  updateStatut(member: any, action: string) {
    const modalref = this.modalService.open(ModalAdminComponent, { centered: true });
    this.translate.get('EXECUTIVE_MEMBER_UPDATE_STATUT').subscribe(trans => {
      modalref.componentInstance.name = trans;
      const modal = { name: trans, actionParams: action, memberParams: member };
      this.member.sendMessageModalAdmin(modal);
    });
  }

 //  ===================================  Impression ================================
    // Construct the table for Impression
    constructTableMembers(data: any[]) {
      this.tableData = [];
      let ligneData = [];
      let index = 1;
      data.forEach(member => {

        if (this.lang === member.language_code) {
          ligneData = [];
          ligneData.push(index);
          ligneData.push(member.Fname);
          ligneData.push(member.Lname);
          ligneData.push(member.Status_desc);
          ligneData.push(member.status_date);
          this.tableData.push(ligneData);
          index++;
        }
    
      });
      return this.tableData;
    }

    // Generate the Pdf
    imprimerPdf() {
      const doc = new jsPDF('landscape');
      const dateFormat = new Date();
      const dateValue = dateFormat.getFullYear() + '-' + (dateFormat.getMonth() + 1 < 10 ?
        '0' + (dateFormat.getMonth() + 1) : (dateFormat.getMonth() + 1)) + '-' + (dateFormat.getDate() < 10 ?
          '0' + dateFormat.getDate() : dateFormat.getDate());
      const heureValue = (dateFormat.getHours() < 10 ?
        '0' + dateFormat.getHours() : dateFormat.getHours()) + ':' + (dateFormat.getMinutes() < 10 ?
          '0' + dateFormat.getMinutes() : dateFormat.getMinutes()) + ':' + (dateFormat.getSeconds() < 10 ?
            '0' + dateFormat.getSeconds() : dateFormat.getSeconds());
      const userInfos = this.user ? this.user.Fname + ' ' + this.user.Lname : 'Administrator';
  
      doc.setFont('courier');
      doc.setFontType('normal');
      doc.setFontSize(12);
      const img = new Image();
      img.src = 'assets/images/medundanda.png';
      this.translate.get(['ALL_STATUT','PRINT_MEMBER_TITLE','FORM_FIRSTNAME','FORM_LASTNAME','FORM_STATUS','FORM_STATUT_DATE','PRINT_BY','PRINT_ON','PRINT_AT','PRINT_TITLE_MEMBER']).subscribe(trans => {
        this.translations.push(trans.PRINT_MEMBER_TITLE);
        this.translations.push(trans.FORM_FIRSTNAME);
        this.translations.push(trans.FORM_LASTNAME);
        this.translations.push(trans.FORM_STATUS);
        this.translations.push(trans.FORM_STATUT_DATE);
        this.translations.push(trans.PRINT_BY);
        this.translations.push(trans.PRINT_ON);
        this.translations.push(trans.PRINT_AT);
        this.translations.push(trans.PRINT_TITLE_MEMBER);
      });
      
      doc.addImage(img, 'png', 230, 10, 50, 20);
  
          doc.text(20, 35, `${this.translations[0]}`);
          doc.autoTable({
            theme: 'grid',
            head: [['Nº',  `${this.translations[1]}`,`${this.translations[2]}`, `${this.translations[3]}`,`${this.translations[4]}`]],
            body: this.constructTableMembers(this.printList),
            margin: { top: 40 },
            didDrawPage: (data) => {
              doc.text(150, 5, `${this.translations[5]} : ` + userInfos
                +` ${this.translations[6]} ` + dateValue + ' ' + ` ${this.translations[7]} ` + heureValue);
            }
          });
        
      doc.save(`${`${this.translations[8]}`}_${this.api.getTimePrefix()}.pdf`);
  
    }

}
