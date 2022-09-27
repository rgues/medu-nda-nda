import { TranslateService } from '@ngx-translate/core';
import { VisiteService } from './../../../service/visite.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from './../../../service/api.service';
import { ErrorService } from 'src/app/service/error.service';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-add-visite',
  templateUrl: './add-visite.component.html',
  styleUrls: ['./add-visite.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddVisiteComponent implements OnInit {

  formVisite: FormGroup;
  loadingShow: boolean;
  visiteReasonList: any;
  visiteRelationList: any;
  listMembers: any;
  startDate: Date;
  user: any;


  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private translate: TranslateService,
    private api: ApiService,
    private member: MembreService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private visite: VisiteService
  ) {

    this.loadingShow = false;
    this.visiteReasonList = [];
    this.visiteRelationList = [];
    this.listMembers = [];
    this.startDate = new Date();
    this.user = this.member.getUserSession();

  }

  // Init the form
  ngOnInit() {
    this.initFormVisite();
    this.getReasonOfVisit();
    this.getRelationType();
    this.getMembers();
  }


  // Ini the visite form
  initFormVisite() {
    this.formVisite = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      member_id: ['', Validators.required],
      relation_id: ['', Validators.required],
      visit_reason_id: ['', Validators.required],
      date: [''],
      dateValue: [this.startDate, Validators.required]
    });
  }

  // form getters

  get prenom() {
    return this.formVisite.get('prenom');
  }

  get nom() {
    return this.formVisite.get('nom');
  }

  get memberId() {
    return this.formVisite.get('member_id');
  }

  get relationId() {
    return this.formVisite.get('relation_id');
  }


  get visitReasonId() {
    return this.formVisite.get('visit_reason_id');
  }

  get dateError() {
    return this.formVisite.get('dateValue');
  }


  // add a visite
  addAvisite() {
    this.loadingShow = true;
    this.spinner.show('add-visite');

    const member = this.member.getUserSession();

    this.formVisite.get('date').setValue(this.api.formatDateTiret(this.formVisite.value.dateValue));

    this.visite.saveAvisite(member.remenber_token, this.formVisite.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('VISIT_ADD_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.visite.sendUpdateMessage('update');
        this.router.navigate(['/visite/visite-list']);
      }
      this.spinner.hide('add-visite');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('add-visite');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logout(member.remenber_token);
          this.translate.get('TOKEN_EXPIRED').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.relation_id_not_exist) {
          this.translate.get('VISIT_RELATION_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.member_id_not_exist) {
          this.translate.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.visit_reason_id_not_exist) {
          this.translate.get('VISIT_REASON_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

  // Get all the reason of visit
  getReasonOfVisit() {
    this.visite.getAllVisiteReasons().subscribe(visite => {
      this.visiteReasonList = visite.visit_reasons;
    }, error => {
      this.error.manageError(error);
    });
  }


  // Get all type of relation
  getRelationType() {
    this.visite.getAllRelationType().subscribe((visite: any) => {
      this.visiteRelationList = visite.type_relation;
    }, error => {
        this.error.manageError(error);
    });
  }

    // Get la liste des membres
    getMembers() {
      this.member.getListOfMembers().subscribe(members => {
        this.listMembers = members.membres;
      }, error => {
        this.error.manageError(error);
      });
    }


}
