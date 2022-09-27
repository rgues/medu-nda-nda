import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { FooterService } from 'src/app/service/footer.service';

@Component({
  selector: 'app-add-footer-link',
  templateUrl: './add-footer-link.component.html',
  styleUrls: ['./add-footer-link.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddFooterLinkComponent implements OnInit {

  formFooter: FormGroup;
  doctypeError: boolean;
  iamgeReadError: boolean;
  loadingShow: boolean;
  categoriesList: any;
  positionsList: any;
  listMembers: any;
  startDate: Date;
  user: any;


  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private footer: FooterService,
    private router: Router,
    private toast: ToastrService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private member: MembreService
  ) {
    this.loadingShow = false;
    this.startDate = new Date();
    this.user = this.member.getUserSession();
  }

  // Init the form
  ngOnInit() {
    this.initFormFooter();
  }


  // Ini the footer form
  initFormFooter() {
    this.formFooter = this.fb.group({
      link_name: ['', Validators.required],
      link_url: ['', Validators.required]
    });
  }

  // form getters
  get linkName() {
    return this.formFooter.get('link_name');
  }

  get linkUrl() {
    return this.formFooter.get('link_url');
  }
  // Create an Article
  createFooter() {
    this.loadingShow = true;
    this.spinner.show('add-footer');
    const member = this.member.getUserSession();

    this.footer.saveFooterLink(member.remenber_token, this.formFooter.value).subscribe(reponse => {

      this.spinner.hide('add-footer');
      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('FOOTER_SUCCESS_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.footer.sendUpdateMessage('update');
        this.router.navigate(['/footer/list-footer-link']);
      }

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('add-footer');
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
