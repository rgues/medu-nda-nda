import { Component, OnInit } from '@angular/core';
import { SurveyService } from 'src/app/service/survey.service';
import { ApiService } from 'src/app/service/api.service';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';

@Component({
  selector: 'app-survey-stats',
  templateUrl: './survey-stats.component.html',
  styleUrls: ['./survey-stats.component.scss']
})
export class SurveyStatsComponent implements OnInit {

  listSurveys: any;
  defaultListSurveys: any;
  loadingShow: boolean;
  user: any;
  searchTerm: string;
  activeList: any;

  // Pagination data
  surveyData: any;
  statsData: any;
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
    this.surveyData = null;
    this.activeList = [];
    this.loadingShow = false;
    this.surveyId = this.activeRoute.snapshot.params.surveyId;
    this.user = this.member.getUserSession();
    this.listMembers = [];

    // Listen to message and update the list
    this.survey.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getStatSuvey();
      }
    });
  }

  ngOnInit() {
    this.getStatSuvey();
  }
  
  // Get members answers
  getStatSuvey() {
    const data = {
      survey_id: this.surveyId,
      language_code:  this.defaultLang
    }
    this.loadingShow = true;
    this.survey.getSurveyStats(this.user.remenber_token, data)
    .subscribe((surveys: any) => {
      this.loadingShow = false;
      this.surveyData = surveys.info_survey;
      this.statsData = surveys.statistique;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }
}
