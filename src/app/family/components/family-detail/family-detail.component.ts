import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from './../../../service/error.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { slideInLeft } from '../../../animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-family-detail',
  templateUrl: './family-detail.component.html',
  styleUrls: ['./family-detail.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class FamilyDetailComponent implements OnInit {

  formFamily: FormGroup;
  loadingShow: boolean;
  fillRequired: boolean;
  familyNameExist: boolean;
  familyIdNotExist: boolean;
  token: string;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private family: FamilleService,
    private member: MembreService,
    private toast: ToastrService,
    private error: ErrorService,
    private modalService: NgbActiveModal
  ) {
      this.fillRequired = false;
      this.familyNameExist = false;
      this.familyIdNotExist = false;
  }

  ngOnInit() {
    this.initFormFamily();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
  }

  initFormFamily() {
      const currentFamily = this.family.getFamilySession();
      let familyData = {
        famille_id: '',
        family_name: '',
        famille_desc: ''
      };

      if (currentFamily) {
        familyData = currentFamily;
      }

      this.formFamily = this.fb.group({
        family_id: [familyData.famille_id, ],
        nom_famille: [familyData.family_name, Validators.required],
        description: [familyData.famille_desc]
      });
  }

  get nomFamille() {
    return this.formFamily.get('nom_famille');
  }

  get description() {
    return this.formFamily.get('description');
  }

    // update  family
    updateFamily() {
      this.loadingShow = true;
      this.spinner.show('update-family');

      this.family.updateFamily(this.token, this.formFamily.value).subscribe(reponse => {

        if (reponse && (reponse.message === 'succes' || reponse.message === 'success')) {
          this.loadingShow = false;
          this.translate.get('FAMILY_UPDATE_SUCCESS').subscribe(trans => {
            this.toast.success(trans);
          });
          this.family.sendUpdateMessage('update');
          this.initFormFamily();
          this.modalService.dismiss();
        }
        this.spinner.hide('update-family');

      }, error => {
        this.modalService.dismiss();
        this.loadingShow = false;
        this.spinner.hide('update-family');
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

          if (error.error.family_id_not_exist) {
            this.translate.get('FAMILY_NAME_NOT_EXIST').subscribe(trans => {
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
