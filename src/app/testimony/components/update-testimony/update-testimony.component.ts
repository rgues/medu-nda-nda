import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { TestimonyService } from 'src/app/service/testimony.service';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-update-testimony',
  templateUrl: './update-testimony.component.html',
  styleUrls: ['./update-testimony.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class UpdateTestimonyComponent implements OnInit {

  formThought: FormGroup;
  doctypeError: boolean;
  iamgeReadError: boolean;
  loadingShow: boolean;
  categoriesList: any;
  positionsList: any;
  listMembers: any;
  startDate: Date;
  user: any;
  defaultLang: string;


  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private error: ErrorService,
    private testimony: TestimonyService,
    private router: Router,
    private toast: ToastrService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private member: MembreService
  ) {
    this.loadingShow = false;
    this.startDate = new Date();
    this.user = this.member.getUserSession();
    this.defaultLang = localStorage.getItem('langue') || 'fr';
    this.listMembers = [];
  }

  // Init the form
  ngOnInit() {
    this.getMembers();
    this.initFormFooter();
  }


  // Ini the footer form
  initFormFooter() {
    const current = this.testimony.getTestimonyData();
    this.formThought = this.fb.group({
      member_id: ['' ,Validators.required],
      thought_id :  [current.thought_id],
      member_desc_fr: [this.defaultLang === 'fr' ? current.member_desc : '', Validators.required],
      member_thought_fr: [this.defaultLang === 'fr'  ? current.member_thought : '', Validators.required],
      member_desc_en: [this.defaultLang === 'en' ? current.member_desc : '', Validators.required],
      member_thought_en: [this.defaultLang === 'en' ? current.member_thought : '', Validators.required]
    });
  }

    // Get la liste des membres
    getMembers() {
      this.loadingShow = true;
      this.member.getListOfMembers().subscribe(members => {
        this.loadingShow = false;
        this.listMembers = this.api.oderByFirstname(members.membres);
        this.getMemberId();
      }, error => {
        this.loadingShow = false;
        this.error.manageError(error);
      });
    }

    // Get the member Id
    getMemberId() {
      const testi = this.testimony.getTestimonyData();
      this.listMembers.forEach(member => {
          if (member && testi && member.Fname === testi.Fname && member.Lname === testi.Lname) {
            this.formThought.get('member_id').setValue(member.member_id);
          }
      }); 
    }

  // form getters
  get author() {
    return this.formThought.get('member_id');
  }

  get memberDesFr() {
    return this.formThought.get('member_desc_fr');
  }

  get memberThoughtFr() {
    return this.formThought.get('member_thought_fr');
  }

  get memberDesEn() {
    return this.formThought.get('member_desc_en');
  }

  get memberThoughtEn() {
    return this.formThought.get('member_thought_en');
  }

  
  // Update an thought
  updateThought() {


    if (this.formThought.value.member_id) {

      this.loadingShow = true;
      this.spinner.show('update-testi');
      const member = this.member.getUserSession();
  
      this.testimony.updateTestimony(member.remenber_token, this.formThought.value).subscribe(reponse => {
  
        this.spinner.hide('update-testi');
        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('TESTIMONY_UPDATE_MSG').subscribe(trans => {
            this.toast.success(trans);
          });
          this.testimony.sendUpdateMessage('update');
          this.router.navigate(['/testimony/list-testimony']);
        }
  
      }, error => {
        this.loadingShow = false;
        this.spinner.hide('update-testi');
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
  
          if (error.error.member_id_not_exist) {
            this.translate.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
              this.toast.error(trans);
            });
          }
  
          if (error.error.member_has_already_thought) {
            this.translate.get('THOUGHT_ALREADY_EXIST').subscribe(trans => {
              this.toast.error(trans);
            });
          }
  
          if (error.error.thought_id_not_exist) {
            this.translate.get('THOUGHT_NOT_EXIST').subscribe(trans => {
              this.toast.error(trans);
            });
          }
  
        } else {
          this.error.manageError(error);
        }
      });

    }
 
  }

}
