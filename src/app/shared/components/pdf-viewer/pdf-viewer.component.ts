import { RapportService } from './../../../service/rapport.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent implements OnInit {

  pdfdataUrl: string;
  index: number;

  constructor(
    private route: ActivatedRoute,
    private report: RapportService
  ) {

  }

  ngOnInit() {
    const doc = this.report.getCurrentDoc();
   // this.pdfdataUrl = 'data:application/pdf;base64,' + doc.content;
    this.pdfdataUrl =  doc.link;
  }


}
