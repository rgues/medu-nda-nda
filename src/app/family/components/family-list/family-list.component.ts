import { TranslateService } from '@ngx-translate/core';
import { MembreRpnFamilyComponent } from './../membre-rpn-family/membre-rpn-family.component';
import { FamilyMemberAddComponent } from './../family-member-add/family-member-add.component';
import { FamilyMemberListComponent } from './../family-member-list/family-member-list.component';
import { ApiService } from './../../../service/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slidePage, slideBlock } from '../../../animations';
import { FamilyDetailComponent } from '../family-detail/family-detail.component';
import { FamilyCreateComponent } from '../family-create/family-create.component';
import { RpnFamilyTransactionComponent } from '../rpn-family-transaction/rpn-family-transaction.component';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'family-list',
  templateUrl: './family-list.component.html',
  styleUrls: ['./family-list.component.scss'],
  animations: [
    slidePage,
    slideBlock
  ]
})
export class FamilyListComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  familyNotExist: boolean;
  families: any;
  activeFamilies: any;
  defaultFamilies: any;
  user: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private family: FamilleService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private translate: TranslateService,
    private router: Router,
    private modalService: NgbModal,
    private api: ApiService
  ) {
    this.loadingShow = false;
    this.familyNotExist = false;
    this.families = [];
    this.activeFamilies = [];
    this.defaultFamilies = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.family.getUpdateMessage().subscribe(data=>{
      if (data && data.message === 'update') {
        this.getFamily();
      }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getFamily();
  }

  // get the family list
  getFamily() {
    this.loadingShow = false;
    this.family.getFamily().subscribe(families => {
      if (families && families.familles) {
        this.loadingShow = false;
        this.defaultFamilies = this.api.oderByFamilyName(families.familles);
        this.families = this.api.formatArrayToMatrix(this.defaultFamilies, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.families.length;
        this.nbItems = this.defaultFamilies.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the families member
  getFamilyMember(family: any) {
    // Open the modal
    this.family.setFamilySession(family);
    this.modalService.open(FamilyMemberListComponent, { centered: true });
  }

  // Update the family
  updateFamily(family: any) {
    // open update modal
    this.family.setFamilySession(family);
    this.modalService.open(FamilyDetailComponent, { centered: true });
  }

  // Add Family members
  addMember(family: any) {
    this.family.setFamilySession(family);
    this.modalService.open(FamilyMemberAddComponent, { centered: true });
  }

  // show RPN members
  rpnMember(family: any) {
    this.family.setFamilySession(family);
    this.modalService.open(MembreRpnFamilyComponent, { centered: true });
  }


  // show rpn Transactions
  rpnTransactions(family: any) {
    this.family.setFamilySession(family);
    this.modalService.open(RpnFamilyTransactionComponent, { centered: true });
  }


  // Add a famille
  addFamily() {
    const modalref = this.modalService.open(FamilyCreateComponent, { centered: true });
    modalref.componentInstance.name = 'Add Family';
  }

  // delete family
  deleteFamily(family: any, index: number) {

  this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {

    if (ans === 'confirm') {

    const param = {
      family_id: family.family_id
    };

    this.loadingShow = true;
    this.spinner.show('delete-family');
    this.family.deleteFamily(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('FAMILY_DELETE_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activeFamilies.splice(index, 1);
        this.getFamily();
      }
      this.spinner.hide('delete-family');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-family');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.family_id_not_exist) {
          this.translate.get('FAMILY_NAME_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
          this.familyNotExist = true;
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
    this.families = this.api.formatArrayToMatrix(this.defaultFamilies, this.nbItemsByPage);
    this.totalPages = this.families.length;
    this.updateActiveList(this.currentPage);
  }

  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.families[id - 1] && this.families[id - 1].length > 0) ?
      this.activeFamilies = this.families[id - 1] : this.activeFamilies = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.families[this.numero - 1] && this.families[this.numero - 1].length > 0) ?
        this.activeFamilies = this.families[this.numero - 1] : this.activeFamilies = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.families.length ? this.numero = position : this.numero = currentId;
      (this.families[this.numero - 1] && this.families[this.numero - 1].length > 0) ?
        this.activeFamilies = this.families[this.numero - 1] : this.activeFamilies = [];
      this.currentPage = this.numero;
    }
  }

}
