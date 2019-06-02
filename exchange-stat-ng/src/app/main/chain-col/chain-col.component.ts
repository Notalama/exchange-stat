import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chain-col',
  templateUrl: './chain-col.component.html',
  styleUrls: ['./chain-col.component.sass']
})
export class ChainColComponent implements OnInit {

  @Input() chain: any[];
  @Input() dollarRate: any[];

  constructor() {
  }

  ngOnInit() {
    console.log(this.chain)
  }

}
