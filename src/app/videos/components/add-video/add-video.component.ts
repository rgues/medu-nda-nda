import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { ErrorService } from 'src/app/service/error.service';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { slideInLeft } from 'src/app/animations';
import { VideosService } from 'src/app/service/videos.service';

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddVideoComponent implements OnInit {
  formVideo: FormGroup;
  doctypeError: boolean;
  videdoReadError: boolean;
  loadingShow: boolean;
  user: any;


  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private member: MembreService,
    private router: Router,
    private toast: ToastrService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private videos: VideosService
  ) {

    this.loadingShow = false;
    this.doctypeError = false;
    this.videdoReadError = false;
  }

  // Init the form
  ngOnInit() {
    this.initFormVideo();
  }

  // Init the video form
  initFormVideo() {
    this.formVideo = this.fb.group({
      title_fr: ['', Validators.required],
      title_en: ['', Validators.required],
      description_fr: ['', Validators.required],
      description_en: ['', Validators.required],
      content_video: ['', Validators.required]
    });
  }

  // form getters
  get titleFr() {
    return this.formVideo.get('title_fr');
  }

  get titleEn() {
    return this.formVideo.get('title_en');
  }

  get video() {
    return this.formVideo.get('content_video');
  }

  get contenuFr() {
    return this.formVideo.get('description_fr');
  }

  get contenuEn() {
    return this.formVideo.get('description_en');
  }


  // Add a video
  addVideo() {
    this.loadingShow = true;
    this.spinner.show('add-video');

    const member = this.member.getUserSession();
    this.videos.uploadVideo(member.remenber_token, this.formVideo.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('VIDEO_UPLOAD_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.videos.sendUpdateMessage('update');
        this.router.navigate(['/videos/list-videos']);
      }
      this.spinner.hide('add-video');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('add-video');
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

  // Update  the image data
  onFileVideo(event) {
    this.doctypeError = false;
    this.videdoReadError = false;
    this.formVideo.get('content_video').setValue('');
    if (event) {
      if (event.filemime === 'video/mp4' || event.filemime === 'video/webm' || event.filemime === 'video/ogg') {
        const videoFormat = 'data:' + event.filemime + ';base64,' + event.data;
        this.formVideo.get('content_video').setValue(videoFormat);
      } else {
        this.doctypeError = true;
      }
    } else {
      this.videdoReadError = true;
    }
  }
}
