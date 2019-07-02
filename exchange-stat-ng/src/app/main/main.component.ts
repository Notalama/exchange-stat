import { ChainService } from './chain.service';
import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {
  cols: any[];
  chains =  [];
  subscribed: any[];
  currentDataArr: any[];
  interval: number;
  minInterval = 5;
  timer = 0;
  // tslint:disable-next-line:variable-name
  constructor(private _chainService: ChainService, private _store: StoreService) { }

  ngOnInit() {

    setInterval(() => {
      this.timer++;
      this.chains.forEach(el => el.age++);
    }, 997);
    // this.loadItems();
    this.reloadInterval();
    this._store.getChains();
    this._store.chains.subscribe(res => {
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
      { field: 'id', header: 'ID' },
    ];
  }

  buildTable(data: any[]) {
    this.currentDataArr = data;
    this.chains = data.sort((a, b) => a.length - b.length).map((chainData, i) => {
      const [dollarRate, profit, isSubs] = chainData.splice(chainData.length - 3, 3);
      const generatedId = this._chainService.generateId(chainData);
      return {
        gain: this._chainService.calcChainProfit(chainData, profit),
        chain: {chainData, dollarRate},
        score: (profit / 100).toFixed(2),
        age: this.currentDataArr.length ?
          this._chainService.getAgeOfChain(generatedId, this.currentDataArr) : 0,
        options: ' ',
        links:  '',
        id: generatedId
      };
    });
  }
  reload() {
    this._store.getChains();
    this.timer = 0;
  }
  updateInterval(interval = 0) {
    if (interval >= 0 || this.interval >= this.minInterval) { this.interval += interval; }
  }
  reloadInterval() {
    // this.loadItems();
    setTimeout(() => {
      this.reloadInterval();
    }, this.interval);
  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this._store.chains.unsubscribe();
  }
}
