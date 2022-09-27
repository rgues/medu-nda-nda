import { ArticlesService } from './../../../service/articles.service';
import { DetailArticleComponent } from './../../../shared/components/detail-article/detail-article.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.scss']
})
export class ListArticlesComponent implements OnInit {

  @Input() articles: any;

  constructor(
    private modalService: NgbModal,
    private article: ArticlesService
  ) {

  }

  ngOnInit() {

  }

  // get a limit size of articles content
  limitSize(content: string) {
    return content && content.length < 300 ? content : content.substring(0, 300) + '...';
  }

  // show more detail
  showMore(article: any) {
    this.article.setCurrentArticle(article);
    this.modalService.open(DetailArticleComponent, { centered: true });
  }

}
