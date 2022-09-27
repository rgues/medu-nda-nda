import { TranslateService } from '@ngx-translate/core';
import { JobService } from './../../../service/job.service';
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
  selector: 'app-register-job',
  templateUrl: './register-job.component.html',
  styleUrls: ['./register-job.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class RegisterJobComponent implements OnInit {

  formJob: FormGroup;
  loadingShow: boolean;
  startDate: Date;

  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private api: ApiService,
    private member: MembreService,
    private translate: TranslateService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private jobService: JobService
  ) {

    this.loadingShow = false;
    this.startDate = new Date();
  }

  // Init the form
  ngOnInit() {
    this.initFormJob();
  }

  // Init the job form
  initFormJob() {
    this.formJob = this.fb.group({
      expired_date: [''],
      expiredDate: [this.startDate, Validators.required],
      title_fr: ['', Validators.required],
      title_en: ['', Validators.required],
      link: ['', Validators.required]
    });
  }

  // form getters
  get titreFr() {
    return this.formJob.get('title_fr');
  }

  get titreEn() {
    return this.formJob.get('title_en');
  }

  get link() {
    return this.formJob.get('link');
  }

  get expireDate() {
    return this.formJob.get('expiredDate');
  }

  // Register a new job
  createJob() {
    this.loadingShow = true;
    this.spinner.show('register-job');

    const member = this.member.getUserSession();

    this.formJob.get('expired_date').setValue(this.api.formatDateTiret(this.formJob.value.expiredDate));

    this.jobService.registerJob(member.remenber_token, this.formJob.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('JOB_REGISTER_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.jobService.sendUpdateMessage('update');
        this.router.navigate(['/job/job-list']);
      }
      this.spinner.hide('register-job');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('register-job');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
          this.translate.get('TOKEN_EXPIRED').subscribe(trans => {
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
