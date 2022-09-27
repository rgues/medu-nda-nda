import { ApiService } from './../../../service/api.service';
import { ErrorService } from 'src/app/service/error.service';
import { ArticlesService } from 'src/app/service/articles.service';
import { Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeIn, rotate, slideRight } from '../../../animations';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    fadeIn,
    rotate,
    slideRight
  ]
})
export class HomeComponent implements OnInit {

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
  ads: any;


  constructor(
    private api: ApiService,
    private article: ArticlesService,
    private errorService: ErrorService,
    private activeRoute: ActivatedRoute
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

    this.categoryId = parseInt(this.activeRoute.snapshot.params.categoryId, 10);
    this.article.getArticleCategory().subscribe(data => {
      this.categoryId = data.articleCategory;
      this.getArticles(true, this.categoryId);
    });

    this.api.getMessageContainer().subscribe(data => {
      if (data && data.canUpdate) {
        this.getArticles(true, this.categoryId);
      }
    });

         // Listen to message and update the list
         this.article.getUpdateMessage().subscribe(data => {
          if (data && data.message === 'update') {
            this.getArticles(true, this.categoryId);
          }
        });
  }


  // Get the current article 
  getAds(articles: any) {
    this.ads = articles;
  }


  ngOnInit() {
    this.getArticles(true, this.categoryId);
  }

  // Get articles categories
  getArcticlesCategories(refresher: boolean) {
    this.article.getCategories(refresher).then(categories => {
      this.categoriesList = categories;
    });
  }

  // Articles positions
  getArcticlesPositions(refresher: boolean) {
    this.article.getArticlePosition(refresher).then(positions => {
      this.positionsList = positions;
    });
  }


  // Get articles list
  getArticles(refresher: boolean, categoryId: number) {
    this.loadingShow = true;
    this.article.getArticles(refresher).then((articles: any) => {
      this.loadingShow = false;
      if (articles && articles.length > 0) {
        const catArticles = [];
        // get the articles categories and position
        articles.forEach(article => {
              if (article.category_id === categoryId && article.position_id === 1) {
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
