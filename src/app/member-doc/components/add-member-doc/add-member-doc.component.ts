import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from '../../../service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-add-member-doc',
  templateUrl: './add-member-doc.component.html',
  styleUrls: ['./add-member-doc.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddMemberDocComponent implements OnInit {

  reportForm: FormGroup;
  typeMimeError: boolean;
  loadingShow: boolean;
  token: string;
  listMembers: any;
  user: any;
  typeReports: any;
  nomDocument: string;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private error: ErrorService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.typeMimeError = false;
    this.loadingShow = false;
    this.user = this.member.getUserSession();
    this.token = this.member.getUserSession().remenber_token;
    this.listMembers = [];
    this.typeReports = [];
    this.nomDocument = '';
  }

  ngOnInit() {
    this.getMembers();
    this.initFormReoprt();
  }

  initFormReoprt() {
    this.reportForm = this.fb.group({
      nom_document:['', Validators.required],
      liste_fiche: [[], Validators.required],
      member_id: [this.user.member_id, Validators.required]
    });
  }

  get docname() {
    return this.reportForm.get('nom_document');
  } 

  get content() {
    return this.reportForm.get('liste_fiche');
  }

  get author() {
    return this.reportForm.get('member_id');
  }

  // Get the author list 
  getMembers() {
    this.member.getListOfMembers().subscribe(members => {
      this.listMembers = this.api.oderByFirstname(members.membres);
    }, error => {
      this.error.manageError(error);
    });
  }
  

  // Get the report
  getDocument(event) {
    this.typeMimeError = false;
    if (event) {
      if (event.filemime === 'application/pdf' || 'image/jpeg' || event.filemime === 'image/gif' ||
      event.filemime === 'image/png') {
        const imageFormat = event.data;
        let  currentDoc : any[] = this.reportForm.value.liste_fiche || [];
        const docname = this.reportForm.value.nom_document;
        currentDoc.push({content: imageFormat, nom_document : docname});
        this.reportForm.get('liste_fiche').setValue(currentDoc);
      } else {
        this.typeMimeError = true;
      }
    }
  }


  // save the report
  saveReport() {
    this.loadingShow = true;
    this.spinner.show('save-report');
    this.member.saveMemberFile(this.token, this.reportForm.value).subscribe(reponse => {

        this.loadingShow = false;
        this.translate.get('REPORT_MEMBERSHIP_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormReoprt();
        this.member.sendUpdateMessage('update');
        this.router.navigate(['/member-doc/list-docs', this.reportForm.value.member_id]);
        this.spinner.hide('save-report');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('save-report');
      if (error && error.error && error.error.message === 'error') {
        if (error.error.invalid_token) {
          this.member.logoutMember();
        }
        if (error.error.member_id_not_exist) {
          this.translate.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }
        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }
      } else {
        this.error.manageError(error);
      }
    });
  }
}
