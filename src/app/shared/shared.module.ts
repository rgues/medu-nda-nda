import { ConfirmLogoutComponent } from './components/confirm-logout/confirm-logout.component';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { RapportService } from './../service/rapport.service';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { FileUploadModule  } from 'ng2-file-upload';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorService } from 'src/app/service/error.service';
import { ApiService } from './../service/api.service';
import { MatComponentsModule } from '../mat-components.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsNavfooterComponent } from './components/bs-navfooter/bs-navfooter.component';
import { DetailArticleComponent } from './components/detail-article/detail-article.component';
import { FileuploadComponent } from './components/fileupload/fileupload.component';
import { ConfirmMessageComponent } from './components/confirm-message/confirm-message.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { ConfirmSurveyComponent } from './components/confirm-survey/confirm-survey.component';
import { VideoViewerComponent } from './components/video-viewer/video-viewer.component';

@NgModule({
  declarations: [
    BsNavfooterComponent,
    DetailArticleComponent,
    FileuploadComponent,
    PdfViewerComponent,
    ConfirmLogoutComponent,
    ConfirmMessageComponent,
    ConfirmSurveyComponent,
    ImageViewerComponent,
    VideoViewerComponent
  ],
  imports: [
    ToastrModule,
    PdfViewerModule,
    FileUploadModule,
    NgxSpinnerModule,
    TranslateModule,
    CommonModule,
    MatComponentsModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports : [
    BsNavfooterComponent,
    DetailArticleComponent,
    FileuploadComponent,
    ConfirmMessageComponent,
    ConfirmSurveyComponent,
    VideoViewerComponent,
    ToastrModule,
    TranslateModule,
    NgxSpinnerModule,
    MatComponentsModule,
    PdfViewerModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule
  ],
  providers: [
    ErrorService,
    ApiService,
    RapportService
  ],
  entryComponents: [
    DetailArticleComponent,
    PdfViewerComponent,
    ImageViewerComponent,
    ConfirmLogoutComponent,
    ConfirmMessageComponent,
    ConfirmSurveyComponent,
    VideoViewerComponent
  ]
})
export class SharedModule {

}
