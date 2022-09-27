import { ApiService } from 'src/app/service/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { SwiperOptions } from 'swiper';
import { TestimonyService } from 'src/app/service/testimony.service';
import { ErrorService } from 'src/app/service/error.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  loading: boolean;
  config: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    breakpoints: {
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 15,
      },
      640: {
        slidesPerView: 1,
        spaceBetween: 10,
        centeredSlides: true,
      },
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
        centeredSlides: true,
      }
    }
  };
  testimonies: any[];
  testimoniesDefault: any[];
  constructor(
    private translate: TranslateService,
    private errorService: ErrorService,
    private testimony: TestimonyService,
    private api: ApiService
  ) {
    this.testimonies = [];
    this.testimoniesDefault = [];
    this.loading = false;
    this.api.getMessageContainer().subscribe(data => {
      if (data && data.canUpdate) {
        this.getCarouselTransaction();
        this.getFooterTestimony();
      }
    });
    // Listen to message and update the list
    this.testimony.getUpdateMessage().subscribe(data => {
      if (data && data.message === 'update') {
        this.getFooterTestimony();
      }
    });
  }

  ngOnInit() {
    this.getCarouselTransaction();
    this.getFooterTestimony();
  }

  // Get carousel transaction
  getCarouselTransaction() {
    this.testimoniesDefault = [];
    this.translate.get(['CAROUSEL_MSG_1', 'CAROUSEL_MSG_2', 'CAROUSEL_MSG_3', 'CAROUSEL_MSG_4', 'CAROUSEL_MSG_5']).subscribe(trans => {
      this.testimoniesDefault.push({ testimony: trans.CAROUSEL_MSG_1, job: 'Banquier, Président', name: 'Armstrong Sache, Banquier, Président' });
      this.testimoniesDefault.push({ testimony: trans.CAROUSEL_MSG_2, job: 'Directeur, Ancien Président', name: 'William Ngassam, Directeur, Ancien Président' });
      this.testimoniesDefault.push({ testimony: trans.CAROUSEL_MSG_3, job: 'Business Intelligence, Admin', name: 'Eric Nkamgnia, Business Intelligence, Admin' });
      this.testimoniesDefault.push({ testimony: trans.CAROUSEL_MSG_4, job: 'Informaticien, Membre fondateur', name: 'Dr Isaac Wougang' });
      this.testimoniesDefault.push({ testimony: trans.CAROUSEL_MSG_5, job: 'Enseignante, Social et culture', name: 'Cathy Tchoumkeu' });
    });
  }

  // Get testimony list
  getFooterTestimony() {
    this.loading = true;
    this.testimony.getTestimony().subscribe((ans: any) => {
      this.loading = false;
      if (ans && ans.thought.length > 0) {
        const testimonies = [];
        ans.thought.forEach(testi => {
          if (testi && testi.thought_status === 1) {
            testimonies.push({ testimony: testi.member_thought, job: testi.member_desc, name: testi.member_desc });
          }
        });
        this.testimonies = testimonies;
      } else {
        this.testimonies = this.testimoniesDefault;
      }
    }, error => {
      this.loading = false;
      this.testimonies = this.testimoniesDefault;
      this.errorService.manageError(error);
    });
  }

}
