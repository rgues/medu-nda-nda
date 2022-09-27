import { ErrorService } from '../../../service/error.service';
import { ApiService } from 'src/app/service/api.service';
import { Component, OnInit, Input } from '@angular/core';
import { ArticlesService } from 'src/app/service/articles.service';
import { SwiperOptions } from 'swiper';


@Component({
  selector: 'app-sidebar-articles',
  templateUrl: './sidebar-articles.component.html',
  styleUrls: ['./sidebar-articles.component.scss']
})
export class SidebarArticlesComponent implements OnInit {

  listArticles: any;
  defaultListArticles: any;
  activelistArticles: any;
  loadingShow: boolean;
  positionsList: any;
  categoriesList: any;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  @Input() position: number;
  config: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    slidesPerView: 1,
    spaceBetween: 0,
    autoplay: true
  };

  constructor(
    private api: ApiService,
    private article: ArticlesService,
    private errorService: ErrorService,
  ) {
    this.listArticles = [];
    this.defaultListArticles = [];
    this.activelistArticles = [];
    this.loadingShow = false;
    this.positionsList = [];
    this.categoriesList = [];

    // Pagination data
    this.totalPages = 1;
    this.nbItems = 0;
    this.nbItemsByPage = 15;
    this.currentPage = 1;
    this.numero = 1;
    // Listen to message and update the list
    this.article.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getArcticlesPositions(true);
        this.getArcticlesSideBar(true);
      }
    });
  }

  ngOnInit() {
    this.getArcticlesPositions(true);
    this.getArcticlesSideBar(true);
  }

  // Articles positions
  getArcticlesPositions(refresher: boolean) {
    this.article.getArticlePosition(refresher).then(positions => {
      this.positionsList = positions;
    });
  }

  // Get articles categories
  getArcticlesCategories(refresher: boolean) {
    this.article.getCategories(refresher).then(categories => {
      this.categoriesList = categories;
    });
  }



  // Get articles list
  getArcticlesSideBar(refresher: boolean) {
    this.loadingShow = true;
    this.article.getArticles(refresher).then((articles: any) => {
      this.loadingShow = false;
      if (articles && articles.length > 0) {
        const catArticles = [];

        // get the articles categories
        articles.forEach(article => {
          if (article.position_id === 2 || article.position_id === 3 || article.position_id === 4) {
            catArticles.push(article);
          }
        });
        this.listArticles = catArticles;
      }

    });
  }


}
