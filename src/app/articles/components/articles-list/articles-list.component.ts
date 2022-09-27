import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorService } from './../../../service/error.service';
import { MembreService } from 'src/app/service/membre.service';
import { ArticlesService } from './../../../service/articles.service';
import { ApiService } from './../../../service/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ConfirmMessageComponent } from 'src/app/shared/components/confirm-message/confirm-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-articles-list',
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.scss']
})
export class ArticlesListComponent implements OnInit {

  categoryId: number;
  listArticles: any;
  defaultListArticles: any;
  activelistArticles: any;
  categoriesList: any;
  loadingShow: boolean;
  positionsList: any;
  cat: number;
  listMembers: any;
  user: any;
  searchTerm: string;

  // Pagination data
  totalPages: number;
  nbItems: number;
  nbItemsByPage: number;
  currentPage: number;
  numero: number;
  categoryFilterId:any;
  isActive: number;

  constructor(
    private api: ApiService,
    private article: ArticlesService,
    private router: Router,
    private member: MembreService,
    private errorService: ErrorService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.listArticles = [];
    this.defaultListArticles = [];
    this.activelistArticles = [];
    this.categoriesList = [];
    this.loadingShow = false;
    this.positionsList = [];
    this.listMembers = [];
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
         this.article.getUpdateMessage().subscribe(data => {
          if (data && data.message === 'update') {
            this.getArcticlesCategories(true);
            this.getArticles(true);
          }
      });
  }


  ngOnInit() {
    this.getMembers();
    this.getArcticlesCategories(false);
    this.getArticles(true);
  }

  // get a limit size of articles content
  limitSize(content: string) {
    return content && content.length < 25 ? content : content.substring(0, 25) + '...';
  }

  // Filter by name
  filterByKeyword(keyword: string) {
    const resultFilter = [];
    let words = '';
    let key = '';
    this.defaultListArticles.forEach(article => {
      if (article) {
        words = article.title;
        words = words.toLowerCase();
        key = keyword.trim().toLowerCase();
        if (words.match(key)) {
          resultFilter.push(article);
        }
      }
    });
    this.listArticles = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.listArticles.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

  // Filter by category
  filterCategory(catId) {
    const resultFilter = [];
    this.defaultListArticles.forEach(article => {
      if (article.category_id === catId ) {
          resultFilter.push(article); 
      }
    });
    this.listArticles = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    this.totalPages = this.listArticles.length;
    this.nbItems = resultFilter.length;
    this.updateActiveList(1);
  }

  // Get all active article
  filterActive(isActive) {
    const resultFilter = [];
    if (isActive === 1) { 
      this.defaultListArticles.forEach(article => {
        if (article.expired === 0 ) {
          console.log(article);
            resultFilter.push(article); 
        }
      });
      this.listArticles = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    } else {
      this.defaultListArticles.forEach(article => {
        if (article.expired !== 0 ) {
            resultFilter.push(article); 
        }
      })
      this.listArticles = this.api.formatArrayToMatrix(resultFilter, this.nbItemsByPage);
    }
    this.updateActiveList(1);
    this.totalPages = this.listArticles.length;
    this.nbItems = resultFilter.length;

  }


  // Get articles list
  getArticles(refresher: boolean) {
    this.loadingShow = true;
    this.article.getArticles(refresher).then((articles: any) => {
      this.loadingShow = false;
      if (articles && articles.length > 0) {
        const articlesList = [];
        articles.forEach(article => {
             // if (article && (article.author_member_id === this.user.member_id  && article.expired === 0) || this.user.executive_id  <= 2 || this.user.executive_id === 5 ||  this.user.executive_id === 6 ) {
                articlesList.push(article);
           //  }
        });
        this.defaultListArticles = articlesList;
        this.listArticles = this.api.formatArrayToMatrix(this.defaultListArticles, this.nbItemsByPage);
        this.updateActiveList(1);
        this.totalPages = this.listArticles.length;
        this.nbItems = this.defaultListArticles.length;
      }

    });
  }

  // Get articles categories
  getArcticlesCategories(refresher: boolean) {
    this.article.getCategories(refresher).then(categories => {
      this.categoriesList = categories;
    });
  }


  // Get la liste des membres
  getMembers() {
    this.member.getListOfMembers().subscribe(members => {
      this.listMembers = members.membres;
    }, error => {
      this.errorService.manageError(error);
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


  // Add a new article
  addArticle() {
    this.router.navigate(['/article/add-article']);
  }

  // Update an article
  updateArticle(article: any) {
    this.article.setCurrentArticle(article);
    this.router.navigate(['/article/update-article']);
  }

  // Delete an article
  deleteArticle(article: any, index: number) {

    this.modalService.open(ConfirmMessageComponent, { centered: true, size: 'sm' }).result.then(ans => {

      if (ans === 'confirm') {

    this.loadingShow = true;
    this.spinner.show('delete-article');
    const member = this.member.getUserSession();

    const param = {
      article_id: article.article_id
    };

    this.article.deleteArticle(member.remenber_token, param).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('ARTILE_DELETE_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.activelistArticles.splice(index, 1);
        this.getArticles(true);
      }
      this.spinner.hide('delete-article');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('delete-article');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.article_id_not_exist) {
          this.translate.get('ARTILE_NOT_EXIST').subscribe(trans => {
            this.toast.success(trans);
          });
        }

        if (error.error.invalid_token) {
          this.member.logoutMember();
        }

      } else {
        this.errorService.manageError(error);
      }
    });
  }
});
  }

  // Get the category of an article
  getCategory(articleCatId: number) {
    let categoryName = '';
    this.categoriesList.forEach(cat => {
      if (cat.category_id === articleCatId) {
        categoryName = cat.category_desc;
      }
    });
    return categoryName;
  }

  // Get the article author
  getAuthor(memberId: number) {
    let authorName = '';
    this.listMembers.forEach(member => {
      if (member.member_id === memberId) {
        authorName = member.Fname + ' ' + member.Lname;
      }
    });
    return authorName;
  }

}
