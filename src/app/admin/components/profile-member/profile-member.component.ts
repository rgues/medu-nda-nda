import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FamilleService } from './../../../service/famille.service';
import { ToastrService } from 'ngx-toastr';
import { MembreService } from 'src/app/service/membre.service';
import { ApiService } from './../../../service/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ErrorService } from 'src/app/service/error.service';
import { Router, ActivatedRoute } from '@angular/router';
// import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { NgxSpinnerService } from 'ngx-spinner';
import { slideInLeft } from '../../../animations';
import { UpdatePasswordComponent } from '../update-password/update-password.component';


@Component({
  selector: 'app-profile-member',
  templateUrl: './profile-member.component.html',
  styleUrls: ['./profile-member.component.scss'],
  animations: [
    slideInLeft
  ]
})
export class ProfileMemberComponent implements OnInit {


 // public uploader: FileUploader = new FileUploader({ url: 'https://evening-anchorage-3159.herokuapp.com/api/' });
  formMember: FormGroup;
  doctypeError: boolean;
  iamgeReadError: boolean;
  loadingShow: boolean;
  countriesList: any;
  roleList: any;
  citiesList: any;
  provinceList: any;
  titleList: any;
  professionList: any;
  sponsorsList: any;
  statusList: any;
  sourcesList: any;
  languageList: any;
  genders: any;
  months: any;
  days: any;
  defaultLang: string;
  errorCodePostal: boolean;
  memberId: number;
  user: any;
  familiesList: any;
  startDate: Date;

  constructor(
    private fb: FormBuilder,
    private error: ErrorService,
    private family: FamilleService,
    private api: ApiService,
    private member: MembreService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private active: ActivatedRoute,
    private translate: TranslateService,
    private modalService: NgbModal
  ) {
    this.loadingShow = false;
    this.doctypeError = false;
    this.iamgeReadError = false;
    this.roleList = [];
    this.countriesList = [];
    this.citiesList = [];
    this.provinceList = [];
    this.titleList = [];
    this.professionList = [];
    this.sponsorsList = [];
    this.statusList = [];
    this.familiesList = [];
    this.sourcesList = [];
    this.languageList = [];
    this.genders = [];
    this.genders.push({ name: 'Homme' });
    this.genders.push({ name: 'Femmme' });
    this.translate.get(['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'])
    .subscribe(trans => {
      this.months = [`${trans.JAN}`, `${trans.FEV}`, `${trans.MAR}`, `${trans.AVR}`, `${trans.MAI}`,`${trans.JUN}`,
       `${trans.JUL}`, `${trans.AOU}`, `${trans.SEP}`, `${trans.OCT}`, `${trans.NOV}`, `${trans.DEC}`];
    });
    this.days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
      25, 26, 27, 28, 29, 30, 31];
    this.defaultLang = localStorage.getItem('langue') || 'fr';
    this.errorCodePostal = false;
    this.startDate = new Date();
  }

  ngOnInit() {
    this.initFormMember();
    this.memberId = this.active.snapshot.params.memberId;
    this.getRole();
    this.getLanguages();
    this.getCities();
    this.getProvinces();
    this.getProfessions();
    this.getStatus();
    this.getTitle();
    this.getSource();
    this.getSponsor();
    this.getFamily();
    this.user = this.member.getUserSession();
    this.getCurrentMemberData(this.memberId, this.user.remenber_token);
  }


  updatePassword() {
     this.modalService.open(UpdatePasswordComponent, { centered: true });
  }

  // Curent member data
  getCurrentMemberData(memberId: number, token: string) {
      this.member.getMemberProfil(memberId, token).subscribe(reponse => {
          if (reponse && reponse.message === 'success') {
            this.initFormMemberData(reponse.user);
          }

      }, error => {
          if (error && error.error && error.error.message === 'error') {
              if (error.error.invalid_token) {
                  // log out the user
                  this.member.logoutMember();
              }
          } else {
            this.error.manageError(error);
          }
      });
  }


  validateCode(code: any) {
    const regex = /^[a-zA-Z0-9]{6}$/;
    if (regex.test(code)) {
      return false;
    } else {
      return true;
    }
  }

  // Check the phone on update
  checkCodePostal(code: string) {
    this.errorCodePostal = this.validateCode(code);
  }

  initFormMember() {
    this.loadingShow = false;
    const dateDemande = new Date();

    this.formMember = this.fb.group({
      title: ['', Validators.compose([Validators.required])],
      lastname: ['', Validators.compose([Validators.required])],
      firstname: ['', Validators.compose([Validators.required])],
      ndap: [''],
      address: [''],
      postal_code: [''],
      city_id: [''],
      province: [''],
      pays: [''],
      telephone1: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$')])],
      telephone2: [''],
      email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$')])],
      picture: [''],
      profession_id: [''],
      day_of_birthday: [''],
      month_of_birthday: [''],
      gender: ['', Validators.compose([Validators.required])],
      sponsor_id: [''],
      status_id: ['', Validators.compose([Validators.required])],
      source_info_id: [''],
      username: [''],
      password: [''],
      date_demande: [dateDemande],
      family_id: [''],
      status_date: [dateDemande],
      langue: [''],
      role_id: ['']
    });
  }

  initFormMemberData(member: any) {

    const dateDemande = new Date();
    this.formMember = this.fb.group({
      title: [member.Title || '', Validators.compose([Validators.required])],
      lastname: [member.Lname || '', Validators.compose([Validators.required])],
      firstname: [member.Fname || '', Validators.compose([Validators.required])],
      ndap: [member.Ndap || ''],
      address: [member.Address || ''],
      postal_code: [member.PostalCode || ''],
      city_id: [member.City_Id || ''],
      province: [member.Province || ''],
      pays: [member.Country || ''],
      telephone1: [member.Telephone1 || '',
      Validators.compose([Validators.required, Validators.pattern('^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$')])],
      telephone2: [member.Telephone2 || ''],
      email: [member.Email || '',
      Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$')])],
      picture: [member.Photo_url  ?  member.Photo_url : ''],
      profession_id: [member.Profession_Id || ''],
      day_of_birthday: [member.DOBDay || ''],
      month_of_birthday: [parseInt(member.DOBMonth, 10) || ''],
      gender: [member.Gender || '', Validators.compose([Validators.required])],
      sponsor_id: [member.Sponsor_Id || ''],
      status_id: [member.Status_Id || '', Validators.compose([Validators.required])],
      source_info_id: [member.info_id || ''],
      username: [member.username || ''],
      password: [member.password || ''],
      date_demande: [member.date_demande || dateDemande],
      langue: [member.language_code || ''],
      role_id: [member.executive_id || ''],
      family_id: [member.family_id || ''],
      status_date: [member.status_date || '']
    });
  }

  // form getters

  get famille() {
    return this.formMember.get('family_id');
  }

  get statusDate() {
    return this.formMember.get('status_date');
  }

  get title() {
    return this.formMember.get('title');
  }

  get lastname() {
    return this.formMember.get('lastname');
  }

  get firstname() {
    return this.formMember.get('firstname');
  }

  get ndap() {
    return this.formMember.get('ndap');
  }


  get address() {
    return this.formMember.get('address');
  }

  get postal_code() {
    return this.formMember.get('postal_code');
  }

  get city_id() {
    return this.formMember.get('city_id');
  }

  get province() {
    return this.formMember.get('city_id');
  }

  get pays() {
    return this.formMember.get('pays');
  }


  get langue() {
    return this.formMember.get('langue');
  }


  get telephone1() {
    return this.formMember.get('telephone1');
  }

  get telephone2() {
    return this.formMember.get('telephone2');
  }

  get email() {
    return this.formMember.get('email');
  }

  get profession_id() {
    return this.formMember.get('profession_id');
  }

  get day_of_birthday() {
    return this.formMember.get('day_of_birthday');
  }

  get month_of_birthday() {
    return this.formMember.get('month_of_birthday');
  }

  get gender() {
    return this.formMember.get('gender');
  }


  get sponsor_id() {
    return this.formMember.get('sponsor_id');
  }

  get status_id() {
    return this.formMember.get('status_id');
  }

  get source_info_id() {
    return this.formMember.get('source_info_id');
  }

  get username() {
    return this.formMember.get('username');
  }

  get password() {
    return this.formMember.get('password');
  }


  get date_demande() {
    return this.formMember.get('date_demande');
  }


  get picture() {
    return this.formMember.get('picture');
  }

    // get the family list
    getFamily() {
      this.loadingShow = false;
      this.family.getFamily().subscribe(families => {
        if (families && families.familles) {
          this.familiesList = this.api.oderByFamilyName(families.familles);
        }
      }, error => {
        this.error.manageError(error);
      });
    }


  // update the member
  updateMember() {
    this.loadingShow = true;
    this.spinner.show('create-member');
    const username = this.formMember.value.firstname + '.' + this.formMember.value.lastname;
    this.formMember.get('username').setValue(username);
    const dateFormat = new Date(this.formMember.value.date_demande);
    const month = (dateFormat.getMonth() + 1 < 10) ? '0' + (dateFormat.getMonth() + 1) : (dateFormat.getMonth() + 1);
    const day = dateFormat.getDate() < 10 ? '0' + dateFormat.getDate() : dateFormat.getDate();
    const formatDate = dateFormat.getFullYear() + '-' + month + '-' + day;
    this.formMember.get('date_demande').setValue(formatDate);
    this.member.updateMemberProfil(this.formMember.value, this.user.member_id, this.user.remenber_token).subscribe(reponse => {

      if (reponse && reponse.message === 'success') {
        this.loadingShow = false;
        this.translate.get('PROFILE_UPDATE_MEMBER_SUCCESS').subscribe(trans => {
          this.toast.success(trans);
        });
        this.router.navigate(['/admin/profile', this.user.member_id]);
      }
      this.spinner.hide('create-member');

    }, error => {
      this.loadingShow = false;
      this.spinner.hide('create-member');
      if (error && error.error && error.error.message === 'error') {

        if (error.error.remplir_tous_les_champs_required) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG1').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.username_already_exist) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG2').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.email_already_exist) {
          this.translate.get('CREATE_MEMEBER_ERROR_MSG3').subscribe(trans => {
            this.toast.error(trans);
          });
        }

        if (error.error.invalid_token) {
            this.member.logoutMember();
        }

        if (error.error.user_not_exist) {
          this.translate.get('PROFILE_MEMBER_NOT_EXIST').subscribe(trans => {
            this.toast.error(trans);
          });
        }

      } else {
        this.error.manageError(error);
      }
    });
  }

  // Get the list of roles
  getRole() {
    this.member.getRoles().subscribe(roles => {
      if (roles && roles.role) {
        this.roleList = roles.role;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the list of languages
  getLanguages() {
    this.member.getLanguages().subscribe(langues => {
      if (langues && langues.langue) {
        this.languageList = langues.langue;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the list of cities
  getCities() {
    this.member.getCities().subscribe(cities => {
      if (cities && cities.city) {
        this.citiesList = cities.city;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the list of provinces
  getProvinces() {
    this.member.getProvinces().subscribe(provinces => {
      if (provinces && provinces.province) {
        this.provinceList = provinces.province;
      }
    }, error => {
      this.error.manageError(error);
    });
  }


  // Get the list of profession
  getProfessions() {
    this.member.getProfession().subscribe(professions => {
      if (professions && professions.profession) {
        this.professionList = professions.profession;
      }
    }, error => {
      this.error.manageError(error);
    });
  }


  // Get the list of status
  getStatus() {
    this.member.getStatut().subscribe(status => {
      if (status && status.status) {
        this.statusList = status.status;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the list of title
  getTitle() {
    this.member.getTitle().subscribe(title => {
      if (title && title.title) {
        this.titleList = title.title;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the list of source
  getSource() {
    this.member.getInfoSources().subscribe(sources => {
      if (sources && sources.source_info) {
        this.sourcesList = sources.source_info;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  // Get the list of source
  getSponsor() {
    this.member.getListOfMembers().subscribe(sponsor => {
      if (sponsor && sponsor.membres) {
        const memberList = [];
        sponsor.membres.forEach(member => {
          if (member.Status_Id === 2) {
            memberList.push(member);
          }
        });
        this.sponsorsList = memberList;
      }
    }, error => {
      this.error.manageError(error);
    });
  }

  formatPhone(phoneData: string) {

    let phone = '';
    if (phoneData) {
      phoneData.split('-').forEach(substr => {
        phone = phone.concat(substr);
      });
    }

    if (phone.length > 1 && phone.length < 3) {
      return phone;
    } else if (phone.length === 3) {
      return phone.substring(0, 3) + '-';
    } else if (phone.length > 3 && phone.length < 7) {
      return phone.substring(0, 3) + '-' + phone.substr(3);
    } else if (phone.length === 6) {
      return phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-';
    } else if (phone.length > 6) {
      return phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substr(6);
    } else {
      return phone;
    }

  }

  // update the 1srt phone number
  updatePhone1(phone: string) {
    this.formMember.get('telephone1').setValue(this.formatPhone(phone));
  }

  // update the 2nd phone number
  updatePhone2(phone: string) {
    this.formMember.get('telephone2').setValue(this.formatPhone(phone));
  }

  // Update  the image data
  onFileImage(event) {
   /* this.doctypeError = false;
    this.iamgeReadError = false;
    this.api.imageReader(event).then((image: any) => {
      if (image && image.filemime === 'image/jpeg' || image.filemime === 'image/gif' || image.filemime === 'image/svg+xml' ||
        image.filemime === 'image/png') {
        const imageFormat = 'data:' + image.filemime + ';base64,' + image.data;
        this.formMember.get('picture').setValue(imageFormat);
      } else {
        this.doctypeError = true;
      }
    }).catch(error => {
      this.iamgeReadError = true;
    });*/

    
    this.doctypeError = false;
    this.iamgeReadError = false;
    this.formMember.get('picture').setValue('');
    if (event) {
      if (event.filemime === 'image/jpeg' || event.filemime === 'image/gif' ||
        event.filemime === 'image/png' || event.filemime === 'image/svg+xml') {
        const imageFormat = 'data:' + event.filemime + ';base64,' + event.data;
        this.formMember.get('picture').setValue(imageFormat);
      } else {
        this.doctypeError = true;
      }
    } else {
      this.iamgeReadError = true;
    }
  }


}
