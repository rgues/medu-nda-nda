import { ArticlesService } from 'src/app/service/articles.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail-article',
  templateUrl: './detail-article.component.html',
  styleUrls: ['./detail-article.component.scss']
})
export class DetailArticleComponent implements OnInit {

  article: any;

  constructor(
    private articleService: ArticlesService
  ) {
    this.article = this.articleService.getCurrentArticle();
   }

  ngOnInit() {
  }

}
