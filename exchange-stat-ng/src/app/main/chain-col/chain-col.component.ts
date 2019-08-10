import { ChainService } from './../chain.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chain-col',
  templateUrl: './chain-col.component.html',
  styleUrls: ['./chain-col.component.sass']
})
export class ChainColComponent implements OnInit {

  @Input() chain: any[];
  @Input() dollarRate: any[];
  @Input() otherRates: any[];

  // sum: number | string;
  // exchOne: string;
  constructor(private _chService: ChainService) {
  }

  ngOnInit() {
    let rateSum = 1000;
    // console.log(this.chain);
    this.chain = this.chain.map((rate, i) => {
      
      rateSum = this.calcRate(rate.give, rate.receive, rateSum);
      const result = { ...rate, calcSum: rateSum };
      return result;
    })
  }

  calcRate(give: number, receive: number, sum) {
    const res = receive > give ? sum * receive : sum / give;
    return res;
  }
}
