import { ApiService } from 'src/app/service/api.service';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-family-reception-list',
  templateUrl: './family-reception-list.component.html',
  styleUrls: ['./family-reception-list.component.scss']
})
export class FamilyReceptionListComponent implements OnInit {

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
    private router: Router,
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
        this.getFamilyReception();
      }
    });
  }

  ngOnInit() {
    const user = this.member.getUserSession();
    this.user = user;
    this.token = user.remenber_token;
    
    this.getFamilyReception();
  }


  // Add a famille
  addFamilyReception() {
   this.router.navigate(['/family/family-reception-add']);
  }

  // get the family list
  getFamilyReception() {
    this.loadingShow = false;
    this.family.getFamilyReception(this.token).subscribe(families => {
      if (families && families.familles_n_ayant_pas_recu) {
        this.loadingShow = false;
        this.defaultFamilies = families.familles_n_ayant_pas_recu;
        this.families = this.api.formatArrayToMatrix(this.defaultFamilies, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.families.length;
        this.nbItems = this.defaultFamilies.length;
      }
    }, error => {
      this.error.manageError(error);
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
