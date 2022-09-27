import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { FeedbackService } from 'src/app/service/feedback.service';

@Component({
  selector: 'app-answer-feedback',
  templateUrl: './answer-feedback.component.html',
  styleUrls: ['./answer-feedback.component.scss']
})
export class AnswerFeedbackComponent implements OnInit {

  feedbackAnswerForm: FormGroup;
  loading: boolean;
  user: any;

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private membre: MembreService,
    private feedback: FeedbackService,
    private error: ErrorService,
    private translate: TranslateService,
    private toast: ToastrService
    ) {
      this.loading = false;
      this.user = this.membre.getUserSession();
    }

    // Init the feedback answer Form
initFeedbackAns() {
  const feed = this.membre.getMemberSession();
  console.log(feed);
  this.feedbackAnswerForm = this.fb.group({
    id: [feed ? feed.id : '', Validators.required],
    answer_member: ['', Validators.required]
  });
}

  get answer() {
    return this.feedbackAnswerForm.get('answer_member');
  }


  ngOnInit() {
    this.initFeedbackAns();
  }

  // Answer feedback
  ansFeedback() {
    this.loading = true;
    this.feedback.answerFeedback(this.user.remenber_token, this.feedbackAnswerForm.value).subscribe(reponse => {
      this.loading = false;
      if (reponse && reponse.message === 'success') {
        this.translate.get('FEEDBACK_ANS_MESSAGE').subscribe(trans => {
            this.toast.success(trans);
        });
        this.feedback.sendUpdateMessage('update');
        this.activeModal.dismiss();
      }

    }, error => {
      this.loading = false;
      if (error && error.error) {
        if ( error.error.invalid_token) {
          this.membre.logoutMember();
        }

        if ( error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.success(trans);
        });
        }

        if ( error.error.id_contact_us_not_exist) {
          this.translate.get('FEEDBACK_CONCTACT_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
        });
        }
          
      } else {
        this.error.manageError(error);
      }
    });
  }
}
