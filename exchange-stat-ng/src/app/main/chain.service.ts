import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChainService {

  constructor() { }

  calcChainProfit(chainData: any[], profit: number) {
    const rateAmounts = [];
    for (let i = 0; i < chainData.length - 3; i++) {
      const rate = chainData[i];
      rateAmounts.push(+rate.amount.dollarAmount);
    }
    const minAmount = Math.min(...rateAmounts);
    return ((minAmount / 100) * profit).toFixed(2) + " $";
  }
}
