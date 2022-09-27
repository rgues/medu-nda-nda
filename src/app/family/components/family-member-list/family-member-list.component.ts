import { ApiService } from 'src/app/service/api.service';
import { FamilleService } from './../../../service/famille.service';
import { Component, OnInit } from '@angular/core';
import { ErrorService } from 'src/app/service/error.service';
import { MembreService } from 'src/app/service/membre.service';

@Component({
  selector: 'app-family-member-list',
  templateUrl: './family-member-list.component.html',
  styleUrls: ['./family-member-list.component.scss']
})
export class FamilyMemberListComponent implements OnInit {
  familiesMembers: any;
  loadingShow: boolean;
  token: string;

  constructor(
      private error: ErrorService,
      private family: FamilleService,
      private api: ApiService,
      private member: MembreService
  ) {
      this.loadingShow = false;
      const user = this.member.getUserSession();
      this.token = user.remenber_token;
      this.familiesMembers = [];
      this.family.getUpdateMessage().subscribe(data=>{
        if (data && data.message === 'update') {
          const familyData = this.family.getFamilySession();
          this.getFamilyMembers(familyData.famille_id, this.token);
        }
      });
   }

  ngOnInit() {
    const familyData = this.family.getFamilySession();
    this.getFamilyMembers(familyData.famille_id, this.token);
  }

    // get the family list
    getFamilyMembers(familyId: number, token: string) {
      this.loadingShow = false;
      this.family.getFamilyMembers(familyId, token).subscribe(families => {
        if (families && families.message === 'success') {
          this.familiesMembers = this.api.oderByAlpha(families.membre_famille);
        }
      }, error => {
          this.error.manageError(error);
      });
    }


}
