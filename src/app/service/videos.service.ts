import { Subject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideosService {
  defaultLang: string;
  subject = new Subject<any>();

  constructor(
    private api: ApiService
  ) {
    const langue = localStorage.getItem('langue');
    if (langue) {
      this.defaultLang = localStorage.getItem('langue');
    } else {
      this.defaultLang = 'fr';
    }
  }

  // update list message 
  sendUpdateMessage(mes: string) {
    this.subject.next({ message: mes });
  }

  getUpdateMessage(): Observable<any> {
    return this.subject.asObservable();
  }



  // Set the videos
  setVideosData(videos: any) {
    localStorage.setItem('videos', JSON.stringify(videos));
  }

  // Get the videos
  getVideosData() {
    const position = localStorage.getItem('videos');
    return position ? JSON.parse(position) : [];
  }

  // Remove the videos
  removeVideosData() {
    localStorage.removeItem('videos');
  }


  // Upload a video
  uploadVideo(token: string, data: any) {
    return this.api.post(`video/upload/${token}`, data);
  }


  // Get list of unapprouve video
  getAllUnapprouveVideo(token: string) {
    return this.api.get(`video/get/video/to/approve/${this.defaultLang}/${token}`);
  }


  // Approuve a video
  approuveVideo(token: string, data: any) {
    return this.api.post(`video/approve/${token}`, data);
  }

  // Get list of approuve video
  getAllApprouveVideo(token: string) {
    return this.api.get(`video/get/video/approved/${this.defaultLang}/${token}`);
  }

  // Disable a video
  disableVideo(token: string, data: any) {
    return this.api.post(`video/desactive/${token}`, data);
  }

  // Update a video
  updateVideo(token: string, data: any) {
    return this.api.post(`video/update/${token}`, data);
  }

  // Delete a video
  deleteVideo(token: string, data: any) {
    return this.api.post(`video/delete/${token}`, data);
  }


}
