import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import { ApiService } from 'src/app/service/api.service';
import { RapportService } from 'src/app/service/rapport.service';

@Component({
  selector: 'app-update-member-doc',
  templateUrl: './update-member-doc.component.html',
  styleUrls: ['./update-member-doc.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class UpdateMemberDocComponent implements OnInit {

 
  reportForm: FormGroup;
  typeMimeError: boolean;
  loadingShow: boolean;
  token: string;
  listMembers: any;
  user: any;
  typeReports: any;
  currentMember: any;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private error: ErrorService,
    private activeRoute: ActivatedRoute,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private report : RapportService,
    private router: Router
  ) {
    this.typeMimeError = false;
    this.loadingShow = false;
    this.user = this.member.getUserSession();
    this.token = this.member.getUserSession().remenber_token;
    this.currentMember = this.activeRoute.snapshot.params.memberId;
    this.listMembers = [];
    this.typeReports = [];
  }

  ngOnInit() {
    this.getMembers();
    this.initFormReoprt();
  }

  initFormReoprt() {
    const currentDoc = this.report.getCurrentDoc();
    this.reportForm = this.fb.group({
      nom_document:[currentDoc ? currentDoc.document_name : '', Validators.required],
      content: [currentDoc ? currentDoc.content : '', Validators.required],
      file_id:[currentDoc ? currentDoc.file_id : '', Validators.required],
      member_id: [currentDoc ? currentDoc.user_id : '', Validators.required]
    });
  }

  
  get docname() {
    return this.reportForm.get('nom_document');
  } 

  get content() {
    return this.reportForm.get('content');
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
        this.reportForm.get('content').setValue(imageFormat);
      } else {
        this.typeMimeError = true;
      }
    }
  }


   // update the report
   updateReport() {
    this.loadingShow = true;
    this.spinner.show('save-report');
    this.member.updateMemberFiles(this.token, this.reportForm.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_MEMBERSHIP_UP_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormReoprt();
        this.member.sendUpdateMessage('update');
        this.router.navigate(['/member-doc/list-docs', this.currentMember]);
      }
      this.spinner.hide('save-report');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('save-report');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.type_file_id_not_exist) {
          this.translate.get('FILE_TYPE_NOT_EXIT').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error && error.error && error.error.member_id_not_exist) {
          this.translate.get('AUTHOR_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

}
