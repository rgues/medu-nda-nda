import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { SurveyService } from 'src/app/service/survey.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-survey-member-answers',
  templateUrl: './survey-member-answers.component.html',
  styleUrls: ['./survey-member-answers.component.scss']
})
export class SurveyMemberAnswersComponent implements OnInit {

  listSurveys: any;
  defaultListSurveys: any;
  loadingShow: boolean;
  user: any;
  searchTerm: string;
  activeList: any;

  // Pagination data
  surveyData: any;
  memberData: any;
  answersData: any;
  defaultLang: string;
  surveyId: any;
  listMembers: any;

  constructor(
    private survey: SurveyService,
    private api: ApiService,
    private activeRoute: ActivatedRoute, 
    private error: ErrorService,
    private member: MembreService,
    private errorService: ErrorService,
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
    this.answersData = [];
    this.activeList = [];
    this.loadingShow = false;
    this.surveyId = this.activeRoute.snapshot.params.surveyId;
    this.user = this.member.getUserSession();
    this.listMembers = [];

    // Listen to message and update the list
    this.survey.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getMmeberAnswers(this.user.member_id);
      }
    });
  }


  ngOnInit() {
    this.getMmeberAnswers(this.user.member_id);
  }

  // Get members answers
  getMmeberAnswers(memberId: any) {
    const data = {
      survey_id: this.surveyId,
      member_id: memberId,
      language_code:  this.defaultLang
    }
    this.loadingShow = true;
    this.survey.getAnswersMembers(this.user.remenber_token, data)
    .subscribe((surveys: any) => {
      this.loadingShow = false;
      this.surveyData = surveys.info_survey;
      this.memberData = surveys.info_member;
      this.answersData = surveys.answers;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }

}
