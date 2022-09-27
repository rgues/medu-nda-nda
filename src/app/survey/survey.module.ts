import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyNewComponent } from './survey-new/survey-new.component';
import { SurveyListComponent } from './survey-list/survey-list.component';
import { SurveyUpdateComponent } from './survey-update/survey-update.component';
import { SurveyDetailComponent } from './survey-detail/survey-detail.component';
import { SurveyAnswerComponent } from './survey-answer/survey-answer.component';
import { SurveyAnswerAddComponent } from './survey-answer-add/survey-answer-add.component';
import { SurveyAnswerUpdateComponent } from './survey-answer-update/survey-answer-update.component';
import { SurveyAnswerMemberComponent } from './survey-answer-member/survey-answer-member.component';
import { SurveyMemberAnswersComponent } from './survey-member-answers/survey-member-answers.component';
import { SurveyMemberListComponent } from './survey-member-list/survey-member-list.component';
import { SurveyStatsComponent } from './survey-stats/survey-stats.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { SurveyAnsweredComponent } from './survey-answered/survey-answered.component';



@NgModule({
  declarations: [
    SurveyNewComponent, 
    SurveyListComponent, 
    SurveyUpdateComponent, 
    SurveyDetailComponent, 
    SurveyAnswerComponent, 
    SurveyAnswerAddComponent, 
    SurveyAnswerUpdateComponent, 
    SurveyAnswerMemberComponent, 
    SurveyMemberAnswersComponent, 
    SurveyMemberListComponent, 
    SurveyStatsComponent,
    SurveyAnsweredComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list-survey', pathMatch: 'full'},
      { path: 'list-survey', component: SurveyListComponent },
      { path: 'add-survey', component: SurveyNewComponent },
      { path: 'update-survey', component: SurveyUpdateComponent },
      { path: 'detail-survey', component: SurveyDetailComponent },
      { path: 'survey-answer/:surveyId', component: SurveyAnswerComponent },
      { path: 'survey-answered/:surveyId', component: SurveyAnsweredComponent },
      { path: 'add-answer-survey/:surveyId', component: SurveyAnswerAddComponent },
      { path: 'update-answer-survey', component: SurveyAnswerUpdateComponent },
      { path: 'survey-member-answer/:surveyId', component: SurveyMemberAnswersComponent },
      { path: 'survey-members/:surveyId', component: SurveyMemberListComponent },
      { path: 'survey-stats/:surveyId', component: SurveyStatsComponent }
  ])
  ],entryComponents:[
    SurveyAnswerMemberComponent
  ]
})
export class SurveyModule { }
