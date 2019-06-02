import { ChainService } from './chain.service';
import { CarService } from './../car.service';
import { Component, OnInit } from '@angular/core';
import { Car } from '../car';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {
  cars: Car[];
  cols: any[];
  chains: any[];
  subscribed: any[];
  currentDataArr: any[];
  constructor(private _chainService: ChainService, private _store: StoreService) { }

  ngOnInit() {
    this._store.getChains();
    this._store.chains.subscribe(res => {
      // this.chains = res;
      console.log(res);
      this.buildTable(res);
      
    }, err => {
      console.log(err);
    });
    this.cols = [
      { field: 'gain', header: 'Max Profit' },
      { field: 'chain', header: 'Ланцюжки' },
      { field: 'score', header: '%' },
      { field: 'age', header: 'Час с' },
      { field: 'options', header: 'Опції' },
      { field: 'links', header: 'Посилання' },
    ];
  }

  buildTable(data: any[]) {
    this.currentDataArr = data;
    this.chains = data.sort((a, b) => a.length - b.length).map((chainData, i) => {
      const [dollarRate, profit, isSubs] = chainData.splice(chainData.length - 3, 3);
      return {
        gain: this._chainService.calcChainProfit(chainData, profit),
        chain: {chainData, dollarRate}
      }
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._store.chains.unsubscribe();
  }
}
