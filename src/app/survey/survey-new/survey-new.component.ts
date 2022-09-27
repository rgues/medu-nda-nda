import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorService } from 'src/app/service/error.service';
import { ApiService } from 'src/app/service/api.service';
import { MembreService } from 'src/app/service/membre.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SurveyService } from 'src/app/service/survey.service';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-survey-new',
  templateUrl: './survey-new.component.html',
  styleUrls: ['./survey-new.component.scss'],
  animations:[
    slideInLeft
  ]
})
export class SurveyNewComponent implements OnInit {

 formSurvey: FormGroup;
 loadingShow: boolean;
 user: any;

 constructor(
   private fb: FormBuilder,
   private error: ErrorService,
   private api: ApiService,
   private member: MembreService,
   private router: Router,
   private toast: ToastrService,
   private translate: TranslateService,
   private spinner: NgxSpinnerService,
   private survey: SurveyService
 ) {
   this.loadingShow = false;
 }

 // Init the form
 ngOnInit() {
   this.initFormSurvey();
 }

 // Init the survey form
 initFormSurvey() {
   this.formSurvey = this.fb.group({
      title_en: ['', Validators.required],
      description_en: ['', Validators.required],
      title_fr: ['', Validators.required],
      description_fr: ['', Validators.required]
   });
 }

 // form getters
 get titleEn() {
   return this.formSurvey.get('title_en');
 }

 get titleFr() {
   return this.formSurvey.get('title_fr');
 }

 get descriptionEn() {
   return this.formSurvey.get('description_en');
 }

 get descriptionFr() {
  return this.formSurvey.get('description_fr');
}


 // Create a survey
 createSurvey() {
   this.loadingShow = true;
   this.spinner.show('add-survey');
   const member = this.member.getUserSession();

   this.survey.createSurvey(member.remenber_token, this.formSurvey.value).subscribe(reponse => {
     if (reponse && reponse.message === 'success') {
       this.loadingShow = false;
       this.translate.get('SURVEY_ADD_SUCCESS_MSG').subscribe(trans => {
         this.toast.success(trans);
       });
       this.survey.sendUpdateMessage('update');
       this.router.navigate(['/survey/list-survey']);
     }
     this.spinner.hide('add-survey');

   }, error => {
     this.loadingShow = false;
     this.spinner.hide('add-survey');
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
