import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'buildExmoLink'
})
export class BuildExmoLinkPipe implements PipeTransform {

  transform(element: any): any {
    let pairLink = (element.toTitle[element.toTitle.length - 1] === ')' ? 
      element.toTitle.substring(element.toTitle.search('\\(') + 1, element.toTitle.length - 1) :
      element.toTitle.substring(element.toTitle.length - 3, element.toTitle.length)) + '_' +
      (element.fromTitle[element.fromTitle.length - 1] === ')' ? 
        element.fromTitle.substring(element.fromTitle.search('\\(') + 1, element.fromTitle.length - 1) :
        element.fromTitle.substring(element.fromTitle.length - 3, element.fromTitle.length));
    if (pairLink === 'BTC_ETH') pairLink = 'ETH_BTC';
    if (pairLink === 'USD_ETH') pairLink = 'ETH_USD';
    if (pairLink === 'USD_BTC') pairLink = 'USD_BTC';
    if (pairLink === 'BTC_LTC') pairLink = 'LTC_BTC';
    if (element.changer === '510') {
      if (pairLink === 'ETH_XMR') pairLink = 'XMR_ETH';
    }
    return pairLink;
  }
}
