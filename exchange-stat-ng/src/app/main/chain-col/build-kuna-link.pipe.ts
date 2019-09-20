import { Pipe, PipeTransform } from '@angular/core';
import { _currs } from '../../static/kuna-curr';
@Pipe({
  name: 'buildKunaLink'
})
export class BuildKunaLinkPipe implements PipeTransform {

  transform(element: any): any {
    return _currs[element.from + element.to] || _currs[element.to + element.from];
  }
}
