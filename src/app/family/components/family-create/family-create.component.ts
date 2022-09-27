import { TranslateService } from '@ngx-translate/core';
import { slideInLeft } from './../../../animations';
import { ErrorService } from 'src/app/service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from './../../../service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-family-create',
  templateUrl: './family-create.component.html',
  styleUrls: ['./family-create.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class FamilyCreateComponent implements OnInit {
  formFamily: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  familyNameExist: boolean;
  token: string;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private family: FamilleService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private router: Router,
    private modalService: NgbActiveModal
  ) {
      this.fillRequired = false;
      this.familyNameExist = false;
  }

  ngOnInit() {
    this.initFormFamily();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormFamily() {
      this.formFamily = this.fb.group({
        nom_famille: ['', Validators.required],
        description: ['']
      });
  }

  get nomFamille() {
    return this.formFamily.get('nom_famille');
  }

  get description() {
    return this.formFamily.get('description');
  }

    // Create family
    createFamily() {
      this.loadingShow = true;
      this.spinner.show('create-family');

      this.family.saveFamily(this.token, this.formFamily.value).subscribe(reponse => {

        if (reponse && (reponse.message === 'succes' || reponse.message === 'success')) {
          this.loadingShow = false;
          this.translate.get('FAMILY_ADD_SUCCESS').subscribe(trans => {
            this.toast.success(trans);
          });
          this.family.sendUpdateMessage('update');
          this.initFormFamily();
          this.modalService.dismiss();
          this.router.navigate(['/family']);
        }
        this.spinner.hide('create-family');

      }, error => {
        this.modalService.dismiss();
        this.loadingShow = false;
        this.spinner.hide('create-family');
        if (error && error.error && error.error.message === 'error') {

          if (error.error.invalid_token) {
            this.member.logoutMember();
          }

          if (error.error.remplir_tous_les_champs) {
            this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
              this.toast.error(trans);
            });
            this.fillRequired = true;
          }

          if (error.error.family_name_already_exist) {
            this.translate.get('FAMILY_NAME_EXIST').subscribe(trans => {
              this.toast.error(trans);
            });
            this.familyNameExist = true;
          }

        } else {
          this.error.manageError(error);
        }
      });
    }


}
