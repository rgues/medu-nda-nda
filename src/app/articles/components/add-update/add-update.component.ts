import { TranslateService } from '@ngx-translate/core';
// import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { ArticlesService } from 'src/app/service/articles.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from './../../../service/api.service';
import { ErrorService } from 'src/app/service/error.service';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { slideInLeft } from 'src/app/animations';

@Component({
  selector: 'app-add-update',
  templateUrl: './add-update.component.html',
  styleUrls: ['./add-update.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class AddUpdateComponent implements OnInit {

  // public uploader: FileUploader = new FileUploader({ url: 'https://evening-anchorage-3159.herokuapp.com/api/' });
  formArticle: FormGroup;
  doctypeError: boolean;
  iamgeReadError: boolean;
  loadingShow: boolean;
  categoriesList: any;
  positionsList: any;
  listMembers: any;
  startDate: Date;
  user: any;


  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private api: ApiService,
    private member: MembreService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private article: ArticlesService,
    private translate: TranslateService
  ) {

    this.loadingShow = false;
    this.doctypeError = false;
    this.iamgeReadError = false;
    this.categoriesList = [];
    this.positionsList = [];
    this.listMembers = [];
    this.startDate = new Date();


  }

  // Init the form
  ngOnInit() {
    this.initFormArticle();
    this.getArcticlesCategories(true);
    this.getArcticlesPositions(true);
    this.getMembers();
  }


  // Ini the article form
  initFormArticle() {
    const currentArticle = this.article.getCurrentArticle();
    this.formArticle = this.fb.group({
      article_id: [currentArticle.article_id, Validators.required],
      date: [new Date(currentArticle.creation_date), Validators.required],
      auteur_id: [currentArticle.author_member_id, Validators.required],
      position_id: [currentArticle.position_id],
      categorie_id: [currentArticle.category_id || ''],
      titre: [currentArticle.title, Validators.required],
      contenu_fr: [currentArticle.language_code === 'fr' ? currentArticle.content : ''],
      contenu_en: [currentArticle.language_code === 'en' ? currentArticle.content : ''],
      expire: [currentArticle.expired || 1, Validators.required],
      date_expiration: [new Date(currentArticle.creation_date)],
      picture: [currentArticle.picture ? `${currentArticle.picture}` : '']
    });
  }

  // form getters

  get dateError() {
    return this.formArticle.get('date');
  }

  get author() {
    return this.formArticle.get('auteur_id');
  }

  get position() {
    return this.formArticle.get('position_id');
  }

  get category() {
    return this.formArticle.get('categorie_id');
  }


  get titre() {
    return this.formArticle.get('titre');
  }

  get contenuFr() {
    return this.formArticle.get('contenu_fr');
  }

  get contenuEn() {
    return this.formArticle.get('contenu_en');
  }

  get expire() {
    return this.formArticle.get('expire');
  }

  get dateExpError() {
    return this.formArticle.get('date_expiration');
  }


  get picture() {
    return this.formArticle.get('picture');
  }


  // Update the article
  updateArticle() {
    this.loadingShow = true;
    this.spinner.show('update-article');

    const member = this.member.getUserSession();

    this.formArticle.get('date').setValue(this.api.formatDateTiret(this.formArticle.value.date));
    this.formArticle.get('date_expiration').setValue(this.api.formatDateTiret(this.formArticle.value.date_expiration));

    this.article.updateArticle(member.remenber_token, this.formArticle.value).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('ARTILE_UPDATED_MSG').subscribe(trans => {
          this.toast.success(trans);
        });
        this.article.sendUpdateMessage('update');
        this.router.navigate(['/article/articles-list']);
      }
      this.spinner.hide('update-article');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('update-article');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.invalid_token) {
          this.member.logoutMember();
          this.translate.get('TOKEN_EXPIRED').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.remplir_tous_les_champs) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.position_id_not_exist) {
          this.translate.get('ARTICLE_POSITION_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.auteur_id_not_exist) {
          this.translate.get('ARTICLE_AUTHOR_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.categorie_id_not_exist) {
          this.translate.get('ARTICLE_CATEGORY_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
           });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

  // Get articles categories
  getArcticlesCategories(refresher: boolean) {
    this.article.getCategories(refresher).then(categories => {
      this.categoriesList = categories;
    });
  }


  // Articles positions
  getArcticlesPositions(refresher: boolean) {
    this.article.getArticlePosition(refresher).then((positions: any) => {
      this.positionsList = positions;
    });
  }

  // Get la liste des membres
  getMembers() {
    this.member.getListOfMembers().subscribe(members => {
      this.listMembers = this.api.oderByFirstname(members.membres);
    }, error => {
      this.error.manageError(error);
    });
  }


  // Update  the image data
  onFileImage(event) {
   /* this.doctypeError = false;
    this.iamgeReadError = false;
    this.api.imageReader(event).then((image: any) => {
      if (image && image.filemime === 'image/jpeg' || image.filemime === 'image/gif' || image.filemime === 'image/svg+xml' ||
        image.filemime === 'image/png') {
        const imageFormat = 'data:' + image.filemime + ';base64,' + image.data;
        this.formArticle.get('picture').setValue(imageFormat);
      } else {
        this.doctypeError = true;
      }
    }).catch(error => {
      this.iamgeReadError = true;
    });*/

    this.doctypeError = false;
    this.iamgeReadError = false;
    this.formArticle.get('picture').setValue('');
    if (event) {
      if (event.filemime === 'image/jpeg' || event.filemime === 'image/gif' ||
        event.filemime === 'image/png' || event.filemime === 'image/svg+xml') {
        const imageFormat = 'data:' + event.filemime + ';base64,' + event.data;
        this.formArticle.get('picture').setValue(imageFormat);
      } else {
        this.doctypeError = true;
      }
    } else {
      this.iamgeReadError = true;
    }
  }

}
