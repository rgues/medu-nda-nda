import { DetailArticleComponent } from '../../../shared/components/detail-article/detail-article.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ArticlesService } from '../../../service/articles.service';
import { ApiService } from 'src/app/service/api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-members-articles',
  templateUrl: './members-articles.component.html',
  styleUrls: ['./members-articles.component.scss']
})
export class MembersArticlesComponent implements OnInit {

  categoryId: number;
  listArticles: any;
  defaultListArticles: any;
  activelistArticles: any;
  categoriesList: any;
  loadingShow: boolean;
  positionsList: any;
  cat: number;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;

  constructor(
    private api: ApiService,
    private article: ArticlesService,
    private modalService: NgbModal
  ) {
    this.listArticles = [];
    this.defaultListArticles = [];
    this.activelistArticles = [];
    this.categoriesList = [];
    this.loadingShow = false;
    this.positionsList = [];

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 5;
    this.currentPage = 1;
    this.numero = 1;
  }


  ngOnInit() {
    this.getArticles(false);
  }
    // get a limit size of articles content
    limitSize(content: string) {
      return content && content.length < 300 ? content : content.substring(0, 300) + '...';
     }


  // Get articles list
  getArticles(refresher: boolean) {
    this.loadingShow = true;
    this.article.getArticles(refresher).then((articles: any) => {
      this.loadingShow = false;
      if (articles && articles.length > 0) {
        const catArticles = [];
        // get the articles categories
        articles.forEach(article => {
              if (article.position_id === 8) {
                catArticles.push(article);
              }
        });
        this.defaultListArticles = catArticles;
        this.listArticles = this.api.formatArrayToMatrix(this.defaultListArticles, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listArticles.length;
        this.nbItems = this.defaultListArticles.length;
      }

    });
  }

  // show more detail
  showMore(article: any) {
    this.article.setCurrentArticle(article);
    this.modalService.open(DetailArticleComponent, { centered: true });
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
    this.listArticles = this.api.formatArrayToMatrix(this.defaultListArticles, this.nbItemsByPage);
    this.totalPages = this.listArticles.length;
    this.updateActiveList(this.currentPage);
  }


  // update active list
  updateActiveList(id: number) {
    this.numero = id;
    (this.listArticles[id - 1] && this.listArticles[id - 1].length > 0) ?
      this.activelistArticles = this.listArticles[id - 1] : this.activelistArticles = [];
    this.currentPage = this.numero;
  }

  // Go to previous list
  previousActiveList(currentId: number) {
    if (currentId > 1) {
      const position = currentId - 1;
      position > 0 ? this.numero = position : this.numero = currentId;
      (this.listArticles[this.numero - 1] && this.listArticles[this.numero - 1].length > 0) ?
        this.activelistArticles = this.listArticles[this.numero - 1] : this.activelistArticles = [];
      this.currentPage = this.numero;
    }
  }

  // Go to next list
  nextActiveList(currentId: number) {
    if (currentId + 1 <= this.totalPages) {
      const position = currentId + 1;
      position <= this.listArticles.length ? this.numero = position : this.numero = currentId;
      (this.listArticles[this.numero - 1] && this.listArticles[this.numero - 1].length > 0) ?
        this.activelistArticles = this.listArticles[this.numero - 1] : this.activelistArticles = [];
      this.currentPage = this.numero;
    }
  }

}
