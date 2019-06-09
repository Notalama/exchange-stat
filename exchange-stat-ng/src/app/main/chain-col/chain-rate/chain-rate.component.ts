import { Component, OnInit, Input } from '@angular/core';
import { Rate } from '../../models/rate';

@Component({
  selector: 'app-chain-rate',
  templateUrl: './chain-rate.component.html',
  styleUrls: ['./chain-rate.component.sass']
})
export class ChainRateComponent implements OnInit {

  @Input() rate: Rate = null;
  @Input() firstItem: Rate = null;
  constructor() { }

  ngOnInit() {
    // this.rate = { ...this.rate, calcSum: this.calcSum(this.rate.give, this.rate.receive, this.sum) };
    // this.sum = this.rate.calcSum;
    // console.log(this.rate);
    // this.sum = this.rateIndex 
  }

  // calcSum(give: number, receive: number, sum: number) {
  //   const res = receive > give ? sum * receive : sum / give;
  //   return res;
  // }
}
