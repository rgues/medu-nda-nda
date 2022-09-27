import { RpnService } from './../../../service/rpn.service';
import { MembreService } from './../../../service/membre.service';
import { FamilleService } from './../../../service/famille.service';
import { ErrorService } from './../../../service/error.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-membre-rpn-family',
  templateUrl: './membre-rpn-family.component.html',
  styleUrls: ['./membre-rpn-family.component.scss']
})
export class MembreRpnFamilyComponent implements OnInit {

  familiesMembersRpn: any;
  familyList: any;
  loadingShow: boolean;
  token: string;

  constructor(
      private error: ErrorService,
      private rpn: RpnService,
      private family: FamilleService,
      private member: MembreService
  ) {
      this.loadingShow = false;
      this.familiesMembersRpn = [];
      this.familyList = [];

      this.family.getUpdateMessage().subscribe(data=>{
        if (data && data.message === 'update') {
          this.getFamily();
        }
      });
   }

   ngOnInit() {
    this.getFamily();
    const user = this.member.getUserSession();
    this.token = user.remenber_token;
    const familyData = this.family.getFamilySession();
    this.getFamilyMembersRpn(familyData.famille_id, this.token);
  }

    // get the family list
    getFamilyMembersRpn(familyId: number, token: string) {
      this.loadingShow = false;
      this.rpn.getRPNFamilyMembers(token, familyId).subscribe(families => {
        if (families && families.message === 'success') {
          this.familiesMembersRpn = families.members_rpn;
        }
      }, error => {
          this.error.manageError(error);
      });
    }

      // get the family list
  getFamily() {
    this.family.getFamily().subscribe(families => {
      if (families && families.familles) {
        this.familyList = families.familles;
      }
    }, error => {
        this.error.manageError(error);
    });
  }

  // Get the family name
  getFamilyName(familleId: number) {
    return this.family.getFamilyName(familleId, this.familyList);
  }


}
