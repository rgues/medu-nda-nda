import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RapportService } from './../../../service/rapport.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { EventsService } from './../../../service/events.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-add-report-doc',
  templateUrl: './add-report-doc.component.html',
  styleUrls: ['./add-report-doc.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddReportDocComponent implements OnInit {

  reportForm: FormGroup;
  typeMimeError: boolean;
  loadingShow: boolean;
  token: string;
  listMembers: any;
  user: any;
  typeReports: any;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private error: ErrorService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private report: RapportService,
    private router: Router
  ) {
    this.typeMimeError = false;
    this.loadingShow = false;
    this.user = this.member.getUserSession();
    this.token = this.user.remenber_token;
    this.listMembers = [];
    this.typeReports = [];
  }

  ngOnInit() {
   // this.getMembers();
    this.getTypeReports();
    this.initFormReoprt();
  }

  initFormReoprt() {
    this.reportForm = this.fb.group({
      type_file_id: ['', Validators.required],
      content: ['', Validators.required],
      nom_document: ['', Validators.required]
    });
  }

  get fileType() {
    return this.reportForm.get('type_file_id');
  }

  get content() {
    return this.reportForm.get('content');
  }

  get docname() {
    return this.reportForm.get('nom_document');
  }



  // Get the author list 
  getMembers() {
    this.member.getListOfMembers().subscribe(members => {
      this.listMembers = this.api.oderByFirstname(members.membres);
    }, error => {
      this.error.manageError(error);
    });
  }

    // get type reports list
    getTypeReports() {
      this.report.getAllTypeFiles(this.token).subscribe(reponse => {
        if (reponse && reponse.type_document) {
          this.typeReports = reponse.type_document;
        }
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


  // save the report
  saveReport() {
    this.loadingShow = true;
    this.spinner.show('save-report');
    this.report.saveFile(this.token, this.reportForm.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_MEMBERSHIP_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormReoprt();
        this.report.sendUpdateMessage('update');
        this.router.navigate(['/doc/list-docs']);
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

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error && error.error && error.error.author_id_not_exist) {
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
