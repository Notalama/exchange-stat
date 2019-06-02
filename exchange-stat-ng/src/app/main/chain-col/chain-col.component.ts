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

  sum: number | string;
  exchOne: string;
  constructor(private _chService: ChainService) {
  }

  ngOnInit() {
    console.log(this.chain)
    this.sum = this.dollarRate ? this._chService.calcRate(+this.dollarRate[3], +this.dollarRate[4], 1000) : 1;

  }

}
