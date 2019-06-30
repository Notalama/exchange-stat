import { Injectable } from '@angular/core';
import { Rate } from './models/rate';

@Injectable({
  providedIn: 'root'
})
export class ChainService {

  constructor() { }

  calcChainProfit(chainData: any[], profit: number) {
    const rateAmounts = [];
    for (let i = 0; i < chainData.length; i++) {
      const rate = chainData[i];
      rateAmounts.push(+rate.amount.dollarAmount);
    }
    const minAmount = Math.min(...rateAmounts);
    return ((minAmount / 100) * profit).toFixed(2) + " $";
  }

  getChainCol(chain: any[], dollarRate: any[]) {
    const rates = chain.length;
    const sum = dollarRate ? this.calcRate(+dollarRate[3], +dollarRate[4], 1000) : 1;
    const calcFirst = this.calcRate(+chain[0].give, +chain[0].receive, +sum);
    const calcSecond = this.calcRate(+chain[1].give, +chain[1].receive, +calcFirst);
    const calcThird = rates >= 3 ? this.calcRate(+chain[2].give, +chain[2].receive, +calcSecond) : null;
    const calcFourth = rates >= 4 ? this.calcRate(+chain[3].give, +chain[3].receive, +calcThird) : null;
    const compiledChain = [];
    chain.forEach(rate => {
      const preLinkC = rate.changer === '899' ? 'https://exmo.me/uk/trade#?pair=' : 'https://www.bestchange.ru/click.php?id=';
      const preLinkBC = 'https://www.bestchange.ru/index.php?';
      const exmoPair = rate.changer === '899' ? this.buildExmoLink(rate) : '';
      const arrowLinkParams = `&from=${rate.from}&to=${rate.to}&url=1">'`;
      const changerLinkParams = rate.changer === '899' ? `${exmoPair}">` : `${rate.changer}&from=${rate.from}&to=${rate.to}&url=1">'`;
      const exch = `<a target="_blank" href="${preLinkBC + arrowLinkParams}<i class="fas fa-arrow-right"></i></a> - 
          <a target="_blank" href="${preLinkC + changerLinkParams + rate.changerTitle}</a>
          (${rate.give} : ${rate.receive};${rate.amount.amount}, ${rate.amount.dollarAmount.toFixed(4)} $) <br>`
        compiledChain.push(exch);
    });
    const currOne = sum + ' ' + chain[0].fromTitle;
    const exchOne = compiledChain[0];
    const currTwo =`<i class="fas fa-arrow-right"></i>${calcFirst}  ${chain[1].fromTitle}`;
    const exchTwo = compiledChain[1];
    const currThree = rates >= 3 ? `<i class="fas fa-arrow-right"></i>${calcSecond} ${chain[2].fromTitle}` : '';
    const exchThree = rates >= 3 ? compiledChain[2] : '';
    const currFour = rates === 4 ? `<i class="fas fa-arrow-right"></i> ${calcSecond} ${chain[3].fromTitle}` : '';
    const exchFour = rates === 4 ? compiledChain[3] : '';
    const exitSum = rates === 2 ? calcSecond : rates === 3 ? calcThird : calcFourth;
    const endChain = `<span style="color: green"><i class="fas fa-arrow-right"></i>${exitSum} ${chain[0].fromTitle}</span>`;
    return currOne + exchOne + currTwo + exchTwo + currThree + exchThree + currFour + exchFour + endChain;
  }

  calcRate(give, receive, sum) {
    const res = receive > give ? sum * receive : sum / give;
    return res.toFixed(4);
  }

  buildExmoLink(el) {
    return (el.toTitle[el.toTitle.length - 1] === ')' ?
      el.toTitle.substring(el.toTitle.search('\\(') + 1, el.toTitle.length - 1) :
      el.toTitle.substring(el.toTitle.length - 3, el.toTitle.length)) + '_' +
      (el.fromTitle[el.fromTitle.length - 1] === ')' ?
        el.fromTitle.substring(el.fromTitle.search('\\(') + 1, el.fromTitle.length - 1) :
        el.fromTitle.substring(el.fromTitle.length - 3, el.fromTitle.length))
  }

  generateId(chain): string {
    return chain.reduce((rateAcc, rateCur) => {
      let accSum = '';
      if (rateAcc.from) accSum = rateAcc.from + rateAcc.to + rateAcc.changer;
      const currSum = accSum + rateCur.from + rateCur.to + rateCur.changer;
      return accSum + currSum;
    });
  }

  getAgeOfChain(chainId: string, currentDataArr: Rate[]): number {
    const pos = currentDataArr.find(el => el.id === chainId);
      if (pos) return pos.age || 0;
      else return 0;
  }
}
