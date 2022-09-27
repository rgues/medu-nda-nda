import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from 'src/app/service/api.service';
import { Component, OnInit } from '@angular/core';
import { RapportService } from 'src/app/service/rapport.service';
import { ImageViewerComponent } from 'src/app/shared/components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-research-member',
  templateUrl: './research-member.component.html',
  styleUrls: ['./research-member.component.scss']
})
export class ResearchMemberComponent implements OnInit {
  listMembers: any;
  defaultListMembers: any;
  lang: string;
  loadingShow: boolean;
  user: any;
  professionList: any;
  citiesList: any;
  formMember: FormGroup;

  // Pagination data
  activelistMembers: any;
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private member: MembreService,
    private errorService: ErrorService,
    private report: RapportService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.listMembers = [];
    this.defaultListMembers = [];
    this.activelistMembers = [];
    const lang = localStorage.getItem('langue');
    lang ? this.lang = lang : this.lang = 'fr';
    this.loadingShow = false;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    this.professionList = [];
    this.citiesList = [];    
  }

  ngOnInit() {
    this.initFormMember();
    this.getProfessions();
    this.getCities();
    this.getMembers();
    this.user = this.member.getUserSession();
  }

  initFormMember() {
    this.formMember = this.fb.group({
      city_id: [0],
      profession_id: [0]
    });
  }


  // Get the list of cities
  getCities() {
    this.member.getCities().subscribe(cities => {
      if (cities && cities.city) {
        this.citiesList = cities.city;
      }
    }, error => {
      this.errorService.manageError(error);
    });
  }


    // get a city name
    getCityName(cityId: number, citiesList: any) {
      let cityName = '';
      citiesList.forEach(city => {
        if (city && city.City_Id === cityId) {
          cityName = city.City;
        }
      });
      return cityName;
    }

  // Get the list of profession
  getProfessions() {
    this.member.getProfession().subscribe(professions => {
      if (professions && professions.profession) {
        this.professionList = professions.profession;
      }
    }, error => {
      this.errorService.manageError(error);
    });
  }


    // get a city name
    getProfessionName(professionId: number, profesionList: any) {
      let profesionName = '';
      profesionList.forEach(prof => {
        if (prof && prof.Profession_Id === professionId) {
          profesionName = prof.Profession_desc;
        }
      });
      return profesionName;
    }


  // Get la liste des membres
  getMembers() {
    this.loadingShow = true;
    this.member.getListOfMemberFiltered(0, 0).subscribe(members => {
      this.loadingShow = false;
      const actifMembers = [];
      const inactifMembers = [];
      let listMembers = [];
      members.membres.forEach(memb => {
        if (memb.Status_Id === 2) {
          actifMembers.push(memb);
        }
      });
      listMembers = actifMembers;
      this.defaultListMembers = listMembers;
      console.log(this.defaultListMembers);
      this.listMembers = this.api.formatArrayToMatrix(this.defaultListMembers, this.nbItemsByPage);
      this.updateActiveList(1);
      this.totalPages = this.listMembers.length;
      this.nbItems = this.defaultListMembers.length;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }

  // research the list of members that match City or Profession
  researchMember() {
    this.listMembers = [];
    this.loadingShow = true;
    this.member.getListOfMemberFiltered(this.formMember.value.city_id || 0, this.formMember.value.profession_id || 0)
      .subscribe(members => {
        this.loadingShow = false;
        const actifMembers = [];
        const inactifMembers = [];
        let listMembers = [];
        members.membres.forEach(memb => {
          if (memb.Status_Id === 2) {
            actifMembers.push(memb);
          } 
        });
        listMembers = actifMembers;
        this.defaultListMembers = listMembers;
        this.listMembers = this.api.formatArrayToMatrix(this.defaultListMembers, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listMembers.length;
        this.nbItems = this.defaultListMembers.length;

      }, error => {
        console.log(error);
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

  // zoom Image to image
  showImage(member: any) {
    if (member && member.Photo_url) {
      this.report.setCurrentDoc({picture: member.Photo_url, name: member.Fname +' ' + member.Lname});
      this.modalService.open(ImageViewerComponent, { size:'lg',centered: true });
    }
  }



}
