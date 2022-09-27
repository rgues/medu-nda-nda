
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'positionFilter'
})
export class PositionFilterPipe implements PipeTransform {

  transform(articles: any[], position: number): any {

    const filterResults = [];

    articles.forEach(article => {
        if (article && article.position_id === position) {
          filterResults.push(article);
        }
    });

    return filterResults;

  }

}
