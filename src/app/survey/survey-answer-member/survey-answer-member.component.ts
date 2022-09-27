import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorService } from 'src/app/service/error.service';
import { ApiService } from 'src/app/service/api.service';
import { MembreService } from 'src/app/service/membre.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SurveyService } from 'src/app/service/survey.service';
import { slideInLeft } from 'src/app/animations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-survey-answer-member',
  templateUrl: './survey-answer-member.component.html',
  styleUrls: ['./survey-answer-member.component.scss'],
  animations:[
    slideInLeft
  ]
})
export class SurveyAnswerMemberComponent implements OnInit {

   formSurvey: FormGroup;
   loadingShow: boolean;
   user: any;
   surveyId: any;
   answerId: any;
   defaultLang: string;
   answersSurveys: any;
  
   constructor(
     private fb: FormBuilder,
     private error: ErrorService,
     private member: MembreService,
     private activeModal: NgbActiveModal,
     private activateRoute: ActivatedRoute,
     private toast: ToastrService,
     private translate: TranslateService,
     private spinner: NgxSpinnerService,
     private survey: SurveyService
   ) {
     this.loadingShow = false;
     this.surveyId = this.activateRoute.snapshot.params.surveyId;
     this.answerId = this.activateRoute.snapshot.params.answerId;
     this.user =  this.member.getUserSession();
   }
  
   // Init the form
   ngOnInit() {
     this.initFormSurvey();
   }
  
   // Init the survey form
   initFormSurvey() {
     const params = this.survey.getCurrentSurvey();
     this.formSurvey = this.fb.group({
      survey_id: [params.surveyId, Validators.required],
      answer_id: [params.answerId, Validators.required],
      member_id: [this.user.member_id, Validators.required],
      comment: ['']
     });
   }
  
   // form getters
  
   get comment() {
     return this.formSurvey.get('comment');
   }


   // Create a survey
   answerSurvey() {
     this.loadingShow = true;
     this.spinner.show('add-survey');
     const member = this.member.getUserSession();
  
     this.survey.answerSurvey(member.remenber_token, this.formSurvey.value).subscribe(reponse => {
       if (reponse && reponse.message === 'success') {
         this.loadingShow = false;
         this.translate.get('SURVEY_ANSWER_SUCCESS_MSG').subscribe(trans => {
           this.toast.success(trans);
         });
         this.survey.sendUpdateMessage('update');
       }
       this.spinner.hide('add-survey');
       setTimeout(() => {
        this.activeModal.dismiss();
      }, 2000);
  
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

         if (error.error.survey_id_not_exist) {
          this.translate.get('SURVEYS_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.answer_id_not_exist) {
          this.translate.get('SURVEYS_ANSWERS_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.member_id_not_exist) {
          this.translate.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

       
       } else {
         this.error.manageError(error);
       }
       setTimeout(() => {
        this.activeModal.dismiss();
      }, 2000);
     });
   }
  
}
