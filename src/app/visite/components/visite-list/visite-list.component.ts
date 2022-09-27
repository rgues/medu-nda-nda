import { TranslateService } from '@ngx-translate/core';
import { VisiteService } from './../../../service/visite.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from './../../../service/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-visite-list',
  templateUrl: './visite-list.component.html',
  styleUrls: ['./visite-list.component.scss']
})
export class VisiteListComponent implements OnInit {

  listVisites: any;
  defaultVisites: any;
  activelistVisites: any;
  loadingShow: boolean;
  user: any;
  memberList: any;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private api: ApiService,
    private visite: VisiteService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private router: Router,
    private member: MembreService,
    private errorService: ErrorService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) {
    this.listVisites = [];
    this.defaultVisites = [];
    this.activelistVisites = [];
    this.memberList = [];
    this.loadingShow = false;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 10;
    this.currentPage = 1;
    this.numero = 1;
    this.user = this.member.getUserSession();
    this.visite.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getVisites();
      }
    });
  }

  ngOnInit() {
    this.getMembers();
    this.getVisites();
  }

  // Get the list of members
  getMembers() {
    this.member.getListOfMembers().subscribe((reponse: any) => {
      if (reponse && reponse.membres) {
        const memberFormat = [];
        reponse.membres.forEach(member => {
          memberFormat.push({ member_id: member.member_id, name: member.Fname + ' ' + member.Lname });
        });
        this.memberList = memberFormat;
      }
    }, error => {
      this.errorService.manageError(error);
    });
  }

  // get a member name
  getMemberName(memeberId: number, membersList: any) {
    let memberName = '';
    membersList.forEach(member => {
      if (member && member.member_id === memeberId) {
        memberName = member.name;
      }
    });
    return memberName;
  }

  // Get articles list
  getVisites() {
    this.loadingShow = true;
    this.visite.getAllVisites(this.user.remenber_token).subscribe((visites: any) => {
      this.loadingShow = false;
      if (visites && visites.visites && visites.visites.length > 0) {
        this.defaultVisites = visites.visites;
        this.listVisites = this.api.formatArrayToMatrix(this.defaultVisites, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listVisites.length;
        this.nbItems = this.defaultVisites.length;
      }
    }, error => {
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
    this.listVisites = this.api.formatArrayToMatrix(this.defaultVisites, this.nbItemsByPage);
    this.totalPages = this.listVisites.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listVisites[id - 1] && this.listVisites[id - 1].length > 0) ?
      this.activelistVisites = this.listVisites[id - 1] : this.activelistVisites = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listVisites[this.numero - 1] && this.listVisites[this.numero - 1].length > 0) ?
        this.activelistVisites = this.listVisites[this.numero - 1] : this.activelistVisites = [];
      this.currentPage = this.numero;
    }
  }


  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listVisites.length ? this.numero = position : this.numero = currentId;
      (this.listVisites[this.numero - 1] && this.listVisites[this.numero - 1].length > 0) ?
        this.activelistVisites = this.listVisites[this.numero - 1] : this.activelistVisites = [];
      this.currentPage = this.numero;
    }
  }

  // Add a new visite
  addVisite() {
    this.router.navigate(['/visite/add-visite']);
  }

  // Update a visite
  updateVisite(visite: any) {
    this.visite.setCurrentVisite(visite);
    this.router.navigate(['/visite/update-visite']);
  }

  // Delete a visite
  deleteVisite(visite: any, index: number) {
    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {
        this.loadingShow = true;
        this.spinner.show('delete-visite');
        const member = this.member.getUserSession();
        const param = {
          visit_id: visite.id
        };

        this.visite.deleteVisite(member.remenber_token, param).subscribe(reponse => {
          if (reponse && reponse.message === 'success') {
            this.loadingShow = false;
            this.translate.get('VISIT_DELETE_SUCCESS_MESSAGE').subscribe(trans => {
              this.toast.success(trans);
            });
            this.activelistVisites.splice(index, 1);
            this.getVisites();
          }
          this.spinner.hide('delete-visite');

        }, error => {
          this.loadingShow = false;
          this.spinner.hide('delete-visite');
          if (error && error.error && error.error.message === 'error') {

            if (error.error.visit_id_not_exist) {
              this.translate.get('VISIT_NOT_EXIST').subscribe(trans => {
                this.toast.error(trans);
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
