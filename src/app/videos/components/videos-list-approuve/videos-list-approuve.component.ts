import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { ArticlesService } from './../../../service/articles.service';
import { ApiService } from './../../../service/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VideosService } from 'src/app/service/videos.service';
import { VideoViewerComponent } from 'src/app/shared/components/video-viewer/video-viewer.component';
import { RapportService } from 'src/app/service/rapport.service';

@Component({
  selector: 'app-videos-list-approuve',
  templateUrl: './videos-list-approuve.component.html',
  styleUrls: ['./videos-list-approuve.component.scss']
})
export class VideosListApprouveComponent implements OnInit {
  listVideos: any;
  defaultListVideos: any;
  activelistVideos: any;
  loadingShow: boolean;
  cat: number;
  user: any;
  searchTerm: string;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  isActive: number;

  constructor(
    private api: ApiService,
    private article: ArticlesService,
    private router: Router,
    private member: MembreService,
    private errorService: ErrorService,
    private modalService: NgbModal,
    private doc: RapportService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private translate: TranslateService,
    private videos: VideosService
  ) {
    this.listVideos = [];
    this.defaultListVideos = [];
    this.activelistVideos = [];
    this.loadingShow = false;
    this.searchTerm = '';
    this.isActive = -1;

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 10;
    this.currentPage = 1;
    this.numero = 1;
    this.user = this.member.getUserSession();
         // Listen to message and update the list
         this.videos.getUpdateMessage().subscribe(data => {
          if (data && data.message === 'update') {
            this.getVideos();
          }
      });
  }


  ngOnInit() {
    this.getVideos();
  }

  // Filter by name
  filterByKeyword(keyword: string) {
    const resultFilter = [];
    let words = '';
    let key = '';
    this.defaultListVideos.forEach(data => {
      if (data) {
        words = data.video.title;
        words = words.toLowerCase();
        key = keyword.trim().toLowerCase();
        if (words.match(key)) {
          resultFilter.push(data);
        }
      }
    });
    this.listVideos = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.listVideos.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

  // Get articles list
  getVideos() {
    this.loadingShow = true;
    this.videos.getAllApprouveVideo(this.user.remenber_token).subscribe((videos: any) => {
      if (videos && videos.liste_videos) {

        const activeVideos = [];
        videos.liste_videos.forEach(data => {
          if (data && data.video && data.video.active === 1) {
            activeVideos.push(data);
          }
        });
        this.defaultListVideos = activeVideos;
        this.listVideos = this.api.formatArrayToMatrix(this.defaultListVideos, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listVideos.length;
        this.nbItems = this.defaultListVideos.length;
      }
      this.loadingShow = false;
    }, error => {
      this.loadingShow = false;
      this.errorService.manageError(error);
    });
  }

  // show the video
  showVideo(video: any) {
   /*  this.doc.setCurrentDoc({video: video.link, title: video.title});
    this.modalService.open(VideoViewerComponent, { centered: true, size: 'lg' }); */
    window.open(video.link, '_blank');
  }

  // Pagination function

  // get number items by page
  getNumberItems() {
    let i = 5;
    const nbItemsByPage = [];
    while (i < this.nbItems) {
      nbItemsByPage.push(i);
      i *= 2;
    }
    return nbItemsByPage;
  }

  // Update the number of pages
  updateNumberItems(nbItems: number) {
    this.nbItemsByPage = nbItems;
    this.listVideos = this.api.formatArrayToMatrix(this.defaultListVideos, this.nbItemsByPage);
    this.totalPages = this.listVideos.length;
    this.updateActiveList(this.currentPage);
  }

  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listVideos[id - 1] && this.listVideos[id - 1].length > 0) ?
      this.activelistVideos = this.listVideos[id - 1] : this.activelistVideos = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listVideos[this.numero - 1] && this.listVideos[this.numero - 1].length > 0) ?
        this.activelistVideos = this.listVideos[this.numero - 1] : this.activelistVideos = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listVideos.length ? this.numero = position : this.numero = currentId;
      (this.listVideos[this.numero - 1] && this.listVideos[this.numero - 1].length > 0) ?
        this.activelistVideos = this.listVideos[this.numero - 1] : this.activelistVideos = [];
      this.currentPage = this.numero;
    }
  }

    // disable a video
    disableVideo(video: any) {

      this.loadingShow = true;
      this.spinner.show('enable-video');
      const member = this.member.getUserSession();
  
      const param = {
        video_id: video.video.video_id
      };
  
      this.videos.disableVideo(member.remenber_token, param).subscribe(reponse => {
  
        if (reponse && reponse.message === 'success') {
          this.loadingShow = false;
          this.translate.get('VIDEO_ENABLE_MSG').subscribe(trans => {
            this.toast.success(trans);
          });
          this.getVideos();
        }
        this.spinner.hide('enable-video');
  
      }, error => {
        this.loadingShow = false;
        this.spinner.hide('enable-video');
        if (error && error.error && error.error.message === 'error') {
  
          if (error.error.invalid_token) {
            this.member.logoutMember();
          }
          if (error.error.video_id_not_exist) {
            this.translate.get('VIDEO_NOT_EXIST').subscribe(trans => {
              this.toast.success(trans);
            });
          }
  
        } else {
          this.errorService.manageError(error);
        }
      });
    
  }

   // Delete a video
   deleteVideo(video: any, index: number) {
    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {
      if (ans === 'confirm') {
    this.loadingShow = true;
    this.spinner.show('delete-video');
    const member = this.member.getUserSession();

    const param = {
      video_id: video.video.video_id
    };

    this.videos.deleteVideo(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('VIDEO_DELETE_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activelistVideos.splice(index, 1);
        this.getVideos();
      }
      this.spinner.hide('delete-video');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-video');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }
        if (error.error.video_id_not_exist) {
          this.translate.get('VIDEO_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

      } else {
        this.errorService.manageError(error);
      }
    });
  }
});
}
  

}
