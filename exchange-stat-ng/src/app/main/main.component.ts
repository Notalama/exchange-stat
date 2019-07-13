import { ChainService } from './chain.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StoreService } from '../store.service';
import { Rate } from './models/rate';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {
  cols: any[];
  chains = [];
  subscribed = [];
  currentDataArr: any[];
  interval: number;
  minInterval = 5;
  timer = 0;
  subscription: any;
  // tslint:disable-next-line:variable-name
  constructor(private _chainService: ChainService, private _store: StoreService) { }

  ngOnInit() {
    console.log(document.getElementById('a'));
    setInterval(() => {
      this.timer++;
      this.chains.forEach(el => el.age++);
    }, 997);
    // this.loadItems();
    this.reloadInterval();
    this._store.getChains();
    this.subscription = this._store.chains.subscribe(res => {
      console.log(res);
      this.buildTable(res);

    }, err => {
      console.log(err);
    });
    this.cols = [
      // { field: 'pin', header: 'Pin' },
      { field: 'gain', header: 'Max Profit' },
      { field: 'chain', header: 'Ланцюжки' },
      { field: 'score', header: '%' },
      { field: 'age', header: 'Час с' },
      { field: 'options', header: 'Опції' },
      { field: 'links', header: '=>' }
    ];
  }
  buildTable(data: any[]) {

    this.chains = data.sort((a, b) => a.length - b.length).map((chainData, i) => {
      const [dollarRate, profit, isSubs] = chainData.splice(chainData.length - 3, 3);
      const generatedId = this._chainService.generateId(chainData);
      return {
        gain: this._chainService.calcChainProfit(chainData, profit),
        chain: {chainData, dollarRate},
        score: `${profit.toFixed(2)} %`,
        age: this.chains.length ?
          this._chainService.getAgeOfChain(generatedId, this.chains) : 0,
        options: ' ',
        links: null,
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

  pin(e): void {
    let subscribeQuery;
    if (this.subscribed.length > 1) {
      subscribeQuery = this.subscribed.reduce((acc, el, i) => {
        const elArr = el.chain.chainData;
        if (i === 1) { return acc.chain.chainData.reduce(this.subsChainReducer) + elArr.reduce(this.subsChainReducer); }
        return acc + elArr.reduce(this.subsChainReducer);
      });
    } else { subscribeQuery = this.subscribed[0].chain.chainData.reduce(this.subsChainReducer); }
    subscribeQuery = subscribeQuery.substring(0, subscribeQuery.length - 1);
    this._store.urlParamsSubject.next({ key: 'chainSubscriptions', value: subscribeQuery });
  }

  private subsChainReducer(rateAcc, rate, j, arr) {
    const ending = j < (arr.length - 1) ? ';' : 'n';
    if (j === 1) { return `${rateAcc.from},${rateAcc.to},${rateAcc.changer};${rate.from},${rate.to},${rate.changer + ending}`; }
    return rateAcc + `${rate.from},${rate.to},${rate.changer + ending}`;
  }
  openAllLinks(idx: number) {
    console.log(idx);
    this._chainService.buildAllLinks(this.chains[idx].chain.chainData);
  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }
}
