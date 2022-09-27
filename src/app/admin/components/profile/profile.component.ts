import { MembreService } from "src/app/service/membre.service";
import { Component, OnInit } from "@angular/core";
import { ErrorService } from "src/app/service/error.service";
import { ActivatedRoute, Router } from "@angular/router";
import { slideInLeft } from "../../../animations";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  animations: [slideInLeft],
})
export class ProfileComponent implements OnInit {
  profilDataUser: any;
  profilDataRpn: any;
  profilDataDiscipline: any;
  profilDataReception: any;
  profilDataTransactionWallet: any;
  profilDataReleveBancaire: any;
  user: any;
  memberId: any;
  currentYear: number;
  loginProcess: boolean;
  months: string[];
  events: any[];

  constructor(
    private error: ErrorService,
    private member: MembreService,
    private translate: TranslateService,
    private active: ActivatedRoute,
    private router: Router,
    private membre: MembreService
  ) {
    const currentDate = new Date();
    this.currentYear = currentDate.getFullYear();
    this.loginProcess = false;
    this.translate
      .get([
        "JAN",
        "FEV",
        "MAR",
        "AVR",
        "MAI",
        "JUN",
        "JUL",
        "AOU",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ])
      .subscribe((trans) => {
        this.months = [
          `${trans.JAN}`,
          `${trans.FEV}`,
          `${trans.MAR}`,
          `${trans.AVR}`,
          `${trans.MAI}`,
          `${trans.JUN}`,
          `${trans.JUL}`,
          `${trans.AOU}`,
          `${trans.SEP}`,
          `${trans.OCT}`,
          `${trans.NOV}`,
          `${trans.DEC}`,
        ];
      });
    this.events = [];
  }

  ngOnInit() {
    this.memberId = this.active.snapshot.params.memberId;
    this.user = this.member.getUserSession();
    this.getCurrentMemberData(this.memberId, this.user.remenber_token);
    this.getDesignatedUserEvent();
  }

  // Curent member data
  getCurrentMemberData(memberId: number, token: string) {
    this.loginProcess = true;
    this.member.getMemberProfil(memberId, token).subscribe(
      (reponse) => {
        this.loginProcess = false;
        if (reponse && reponse.message === "success") {
          this.profilDataUser = reponse.user;
          this.profilDataRpn = reponse.rpn ? reponse.rpn[0] : null;
          this.profilDataDiscipline = reponse.discipline
            ? reponse.discipline[0]
            : null;
          this.profilDataReception = reponse.reception
            ? reponse.reception[0]
            : null;
          this.profilDataTransactionWallet = reponse.rpn
            ? reponse.rpn[0].transactions_rpn_wallet
            : null;
          this.profilDataReleveBancaire = reponse.releve_bancaire_wallet
            ? reponse.releve_bancaire_wallet[0]
            : null;
        }
      },
      (error) => {
        this.loginProcess = false;
        if (error && error.error) {
          if (error.error.invalid_token) {
            this.member.logoutMember();
          }
        } else {
          this.error.manageError(error);
        }
      }
    );
  }

  // Get the the designated list of event for the user
  getDesignatedUserEvent() {
    this.member
      .getEventsDesignated(this.user.remenber_token, this.memberId)
      .subscribe(
        (reponse) => {
          if (reponse && reponse.message === "success") {
            this.events = reponse.events;
          }
        },
        (error) => {
          if (error && error.error) {
            if (error.error.invalid_token) {
              this.member.logoutMember();
            }
          } else {
            this.error.manageError(error);
          }
        }
      );
  }

  // update the user profile
  updateProfile(user: any) {
    this.membre.setMemberSession(user);
    this.router.navigate(["/admin/profile-member", this.memberId]);
  }
}
