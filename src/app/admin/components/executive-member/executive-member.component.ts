import { AddExecutiveMemberComponent } from './../add-executive-member/add-executive-member.component';
import { TranslateService } from '@ngx-translate/core';
import { ModalAdminComponent } from './../modal-admin/modal-admin.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/service/api.service';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-executive-member',
  templateUrl: './executive-member.component.html',
  styleUrls: ['./executive-member.component.scss']
})
export class ExecutiveMemberComponent implements OnInit {
  listMembers: any;
  defaultListMembers: any;
  lang: string;
  loadingShow: boolean;

  // Pagination data
  activelistMembers: any;
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  user: any;

  constructor(
    private member: MembreService,
    private translate: TranslateService,
    private errorService: ErrorService,
    private api: ApiService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.listMembers = [];
    this.defaultListMembers = [];
    const lang = localStorage.getItem('langue');
    lang ? this.lang = lang : this.lang = 'fr';
    this.loadingShow = false;

    // Pagination data
    this.activelistMembers = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
      // Listen to message and update the list
      this.member.getUpdateMessage().subscribe(data => {
        if (data && data.message === 'update') {
          this.getExecutifsMembers();
        }
    });
  }

  ngOnInit() {
    this.getExecutifsMembers();
    this.user = this.member.getUserSession();
  }

    // add new member
    addMember() {
      this.modalService.open(AddExecutiveMemberComponent, { centered: true , size : 'lg'});
    }


  // Get la liste des membres
  getExecutifsMembers() {
    this.loadingShow = true;
    this.member.getMembersBureauExecutif().subscribe(members => {
      this.loadingShow = false;
      const actifMembers = [];
      const inactifMembers = [];
      let listMembers = [];
      members.membres.forEach(memb => {
        if (memb.Status_desc === 'Actif') {
          actifMembers.push(memb);
        } else {
          inactifMembers.push(memb);
        }
      });
      listMembers = actifMembers.concat(inactifMembers);
      this.defaultListMembers = listMembers;
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
        const modal = {name: trans, actionParams : action, memberParams: member };
        this.member.sendMessageModalAdmin(modal);
      });

   }

    // update Role
    updateRole(member: any, action: string) {
      const modalref = this.modalService.open(ModalAdminComponent, { centered: true });
      this.translate.get('EXECUTIVE_MEMBER_UPDATE_ROLE').subscribe(trans => {
        modalref.componentInstance.name = trans;
        const modal = {name: trans,  actionParams : action, memberParams: member };
        this.member.sendMessageModalAdmin(modal);
      });
    }

}
