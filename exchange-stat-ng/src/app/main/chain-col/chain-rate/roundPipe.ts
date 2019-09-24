import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundPipe'
})
export class RoundPipe implements PipeTransform {

  transform(element: number): any {
    const stringRoundValue = element.toString().split('.');
    if (stringRoundValue[1] === '0000') return stringRoundValue[0];
    return element;
  }
}
