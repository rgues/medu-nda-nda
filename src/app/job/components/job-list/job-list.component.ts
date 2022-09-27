import { TranslateService } from '@ngx-translate/core';
import { JobService } from './../../../service/job.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from './../../../service/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {

  listJobs: any;
  defaultListJobs: any;
  activelistJobs: any;
  loadingShow: boolean;
  user: any;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private api: ApiService,
    private jobService: JobService,
    private modalService: NgbModal,
    private router: Router,
    private translate: TranslateService,
    private member: MembreService,
    private errorService: ErrorService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) {
    this.listJobs = [];
    this.defaultListJobs = [];
    this.activelistJobs = [];
    this.loadingShow = false;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 10;
    this.currentPage = 1;
    this.numero = 1;
    this.user = this.member.getUserSession();
    this.jobService.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getJobs();
      }
    });
  }


  ngOnInit() {
    this.getJobs();
  }

  // Get jobs list
  getJobs() {
    this.loadingShow = true;
    this.jobService.getAlljobs().subscribe((jobs: any) => {
      this.loadingShow = false;
      if (jobs && jobs.jobs && jobs.jobs.length > 0) {
        const jobsList = [];
        jobs.jobs.forEach(job => {
            if (job && job.expire === 0) {
              jobsList.push(job);
            }
        });
        this.defaultListJobs = jobsList;
        this.listJobs = this.api.formatArrayToMatrix(this.defaultListJobs, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listJobs.length;
        this.nbItems = this.defaultListJobs.length;
      }

    }, error => {
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
    this.listJobs = this.api.formatArrayToMatrix(this.defaultListJobs, this.nbItemsByPage);
    this.totalPages = this.listJobs.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listJobs[id - 1] && this.listJobs[id - 1].length > 0) ?
      this.activelistJobs = this.listJobs[id - 1] : this.activelistJobs = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listJobs[this.numero - 1] && this.listJobs[this.numero - 1].length > 0) ?
        this.activelistJobs = this.listJobs[this.numero - 1] : this.activelistJobs = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listJobs.length ? this.numero = position : this.numero = currentId;
      (this.listJobs[this.numero - 1] && this.listJobs[this.numero - 1].length > 0) ?
        this.activelistJobs = this.listJobs[this.numero - 1] : this.activelistJobs = [];
      this.currentPage = this.numero;
    }
  }


  // Add a new job
  addJob() {
    this.router.navigate(['/job/register-job']);
  }

  // Update a job
  updateJob(job: any) {
    this.jobService.setCurrentJob(job);
    this.router.navigate(['/job/update-job']);
  }

  // Delete a job
  deleteJob(job: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {

    this.loadingShow = true;
    this.spinner.show('delete-article');
    const member = this.member.getUserSession();

    const param = {
      job_id: job.job_id
    };

    this.jobService.deleteAjob(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('JOB_DELETE_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });

        this.activelistJobs.splice(index, 1);
        this.getJobs();
      }
      this.spinner.hide('delete-article');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-article');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.job_id_not_exist) {
          this.translate.get('JOB_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.invalid_token) {
            this.member.logoutMember();
        }

      } else {
        this.errorService.manageError(error);
      }
    });
    }
  });
  }

  // Expire a job
  expireJob(job: any, index: number) {

    this.loadingShow = true;
    this.spinner.show('delete-article');
    const member = this.member.getUserSession();

    const param = {
      job_id: job.job_id
    };

    this.jobService.expireAjob(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('JOB_DISABLE').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activelistJobs.splice(index, 1);
        this.getJobs();
      }
      this.spinner.hide('delete-article');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-article');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.job_id_not_exist) {
          this.translate.get('JOB_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.invalid_token) {
            this.member.logoutMember();
        }

      } else {
        this.errorService.manageError(error);
      }
    });
  }


}
