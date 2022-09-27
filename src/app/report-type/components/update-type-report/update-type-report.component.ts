import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RapportService } from './../../../service/rapport.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { EventsService } from './../../../service/events.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-update-type-report',
  templateUrl: './update-type-report.component.html',
  styleUrls: ['./update-type-report.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class UpdateTypeReportComponent implements OnInit {

  reportTypeForm: FormGroup;
  loadingShow: boolean;
  token: string;

  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private translate: TranslateService,
    private member: MembreService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private report: RapportService,
    private router: Router
  ) {
    this.loadingShow = false;
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  ngOnInit() {
    this.initFormTypeReport();
  }

  initFormTypeReport() {
    const currentType = this.report.getCurrentDoc();
    this.reportTypeForm = this.fb.group({
      type_file_id:[currentType ?  currentType.type_file_id : '', Validators.required],
      description: [currentType ?  currentType.description : '', Validators.required]
    });
  }


  get description() {
    return this.reportTypeForm.get('description');
  }

  // update the report
  updateTypeReport() {
    this.loadingShow = true;
    this.spinner.show('save-report');
    this.report.updateTypeFiles(this.token, this.reportTypeForm.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_TYPE_UPDATE_SUCCESS_MESSAGE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.initFormTypeReport();
        this.report.sendUpdateMessage('update');
        this.router.navigate(['/report-type/list-type']);
      }
      this.spinner.hide('save-report');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('save-report');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if(error && error.error && error.error.type_file_id_not_exist) {
          this.translate.get('FILE_TYPE_NOT_EXIT').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }
}
