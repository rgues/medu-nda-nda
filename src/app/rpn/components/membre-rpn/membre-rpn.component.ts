import { TranslateService } from '@ngx-translate/core';
import { MembreRpnUpdateComponent } from './../membre-rpn-update/membre-rpn-update.component';
import { FamilleService } from './../../../service/famille.service';
import { MembreRpnAddComponent } from './../membre-rpn-add/membre-rpn-add.component';
import { RpnService } from './../../../service/rpn.service';
import { ApiService } from 'src/app/service/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-membre-rpn',
  templateUrl: './membre-rpn.component.html',
  styleUrls: ['./membre-rpn.component.scss']
})
export class MembreRpnComponent implements OnInit {

  loadingShow: boolean;
  token: string;
  familyNotExist: boolean;
  rpnMembers: any;
  activerpnMembers: any;
  defaultrpnMembers: any;
  user: any;
  familyList: any;
  currentFamily: any;

  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private rpn: RpnService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private router: Router,
    private family: FamilleService,
    private modalService: NgbModal,
    private api: ApiService
  ) {
    this.loadingShow = false;
    this.familyNotExist = false;
    this.rpnMembers = [];
    this.activerpnMembers = [];
    this.defaultrpnMembers = [];
    this.familyList = [];
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.rpn.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update'){
        this.getRPNMembers();
      }
  });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    this.getRPNMembers();
    this.getFamily();
  }

  // get the rpn member list
  getRPNMembers() {
    this.loadingShow = false;
    this.rpn.getRPNMembers(this.token).subscribe(reponse => {
      if (reponse && reponse.members_rpn) {
        this.loadingShow = false;
        this.defaultrpnMembers = reponse.members_rpn;
        this.rpnMembers = this.api.formatArrayToMatrix(this.defaultrpnMembers, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.rpnMembers.length;
        this.nbItems = this.defaultrpnMembers.length;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Update rpn member data
  updateRPNMember(member: any) {
    // open update modal
    this.rpn.setMemberRpn(member);
    this.modalService.open(MembreRpnUpdateComponent, { centered: true , size : 'lg'});
  }

  // Add rpn members
  addMember( ) {
   this.modalService.open(MembreRpnAddComponent, { centered: true , size : 'lg' });
  }




  // Filter the list of member by family name
  filetrByFamily(familyId: any) {
    let familyMembers = [];
    if (familyId !== '-1' ) {
      this.defaultrpnMembers.forEach(member => {
          if (member.family_id === parseInt(familyId, 10)) {
            familyMembers.push(member);
          }
      });
    } else {
      familyMembers = this.defaultrpnMembers;
    }
    this.rpnMembers = this.api.formatArrayToMatrix(familyMembers, this.nbItemsByPage);
    this.updateActiveList(1);
    this.totalPages = this.rpnMembers.length;
    this.nbItems = familyMembers.length;
 
  }


  // get the family list
  getFamily() {
    this.family.getFamily().subscribe(families => {
      if (families && families.familles) {
        this.familyList = this.api.oderByFamilyName(families.familles);
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the family name
  getFamilyName(familleId: number) {
    return this.family.getFamilyName(familleId, this.familyList);
  }

  // delete rpn member
  deleteRPNMember(member: any) {
    const param = {
      rpn_id: member.rpn_id
    };
    this.loadingShow = true;
    this.spinner.show('delete-rpn-member');
    this.rpn.deleteRPNMember(this.token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('RPN_DELETE_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
      }
      this.spinner.hide('delete-rpn-member');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-rpn-member');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.rpn_id_not_exist) {
          this.translate.get('RPN_FAMILY_NAME_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
          this.familyNotExist = true;
        }

      } else {
        this.error.manageError(error);
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
    this.rpnMembers = this.api.formatArrayToMatrix(this.defaultrpnMembers, this.nbItemsByPage);
    this.totalPages = this.rpnMembers.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.rpnMembers[id - 1] && this.rpnMembers[id - 1].length > 0) ?
      this.activerpnMembers = this.rpnMembers[id - 1] : this.activerpnMembers = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.rpnMembers[this.numero - 1] && this.rpnMembers[this.numero - 1].length > 0) ?
        this.activerpnMembers = this.rpnMembers[this.numero - 1] : this.activerpnMembers = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.rpnMembers.length ? this.numero = position : this.numero = currentId;
      (this.rpnMembers[this.numero - 1] && this.rpnMembers[this.numero - 1].length > 0) ?
        this.activerpnMembers = this.rpnMembers[this.numero - 1] : this.activerpnMembers = [];
      this.currentPage = this.numero;
    }
  }

  // Go to the RPN wallet page
  walletRPNMember() {
      this.router.navigate(['/rpn/rpn-wallet']);
  }



}
