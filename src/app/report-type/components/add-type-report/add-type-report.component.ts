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

@Component({
  selector: 'app-add-type-report',
  templateUrl: './add-type-report.component.html',
  styleUrls: ['./add-type-report.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddTypeReportComponent implements OnInit {

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
    this.reportTypeForm = this.fb.group({
      description: ['', Validators.required]
    });
  }

  get description() {
    return this.reportTypeForm.get('description');
  }

  // save the report
  saveTypeReport() {
    this.loadingShow = true;
    this.spinner.show('save-report');
    this.report.saveTypeFile(this.token, this.reportTypeForm.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('REPORT_TYPE_ADD_SUCCESS_MESSAGE').subscribe(trans => {
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

      } else {
        this.error.manageError(error);
      }
    });
  }

}
