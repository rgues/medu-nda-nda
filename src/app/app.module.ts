import { HttpClient } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";

import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CoreModule } from "./core/core.module";
import { ToastrModule } from "ngx-toastr";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { SharedModule } from "./shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
//import { AdminNavbarComponent } from "./admin/components/admin-navbar/admin-navbar.component";

import { AdminHomeComponent } from "./admin/components/admin-home/admin-home.component";
import { AdminHeaderComponent } from './admin/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from './admin/components/admin-sidebar/admin-sidebar.component';
import { DashboardComponent } from "./core/components/dashboard/dashboard.component";
import {
  MatSidenavModule,
  MatDividerModule,
  MatCardModule,
  MatPaginatorModule,
  MatTableModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
} from "@angular/material";

import { MembreService } from "./service/membre.service";
import { ApiService } from "./service/api.service";
import { SendMessageComponent } from "./admin/components/send-message/send-message.component";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", '.json?nocache=' + new Date().getTime());
}

@NgModule({
  declarations: [
    AppComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminHomeComponent,
    DashboardComponent,
    SendMessageComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    SharedModule,
    BrowserAnimationsModule,
    CoreModule,
    MatSidenavModule,
    MatDividerModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ToastrModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [ApiService, MembreService],
  entryComponents: [SendMessageComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
