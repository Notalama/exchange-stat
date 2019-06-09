import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'buildExmoLink'
})
export class BuildExmoLinkPipe implements PipeTransform {

  transform(element: any): any {
    return (element.toTitle[element.toTitle.length - 1] === ')' ? 
      element.toTitle.substring(element.toTitle.search('\\(') + 1, element.toTitle.length - 1) :
      element.toTitle.substring(element.toTitle.length - 3, element.toTitle.length)) + '_' +
      (element.fromTitle[element.fromTitle.length - 1] === ')' ? 
        element.fromTitle.substring(element.fromTitle.search('\\(') + 1, element.fromTitle.length - 1) :
        element.fromTitle.substring(element.fromTitle.length - 3, element.fromTitle.length));
  }
}
