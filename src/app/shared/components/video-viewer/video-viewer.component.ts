import { RapportService } from './../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-video-viewer',
  templateUrl: './video-viewer.component.html',
  styleUrls: ['./video-viewer.component.scss']
})
export class VideoViewerComponent implements OnInit {

  videodataUrl: any;
  title: any;
  index: number;

  constructor(
    private report: RapportService,
    public sanitizer: DomSanitizer,
  ) {

  }

  ngOnInit() {
    const doc = this.report.getCurrentDoc();
    this.videodataUrl = doc.video;
    this.title = doc && doc.title ? doc.title : '';
  }


}
