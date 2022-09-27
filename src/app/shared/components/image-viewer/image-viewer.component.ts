import { RapportService } from './../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  imagedataUrl: string;
  username: any;
  index: number;

  constructor(
    private report: RapportService
  ) {

  }

  ngOnInit() {
    const doc = this.report.getCurrentDoc();
    this.imagedataUrl = doc.picture;
    this.username = doc && doc.name ? doc.name : '';
  }


}
