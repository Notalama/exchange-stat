import { HttpClient } from '@angular/common/http';
import { ChainService } from './chain.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StoreService } from '../store.service';
import { Rate } from './models/rate';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {
  cols: any[];
  chains = [];
  subscribed = [];
  subscribedIds = [];
  currentDataArr: any[];
  interval: number;
  minInterval = 6000;
  timer = 0;
  subscription: Subscription;
  toggleLoader = true;
  // tslint:disable-next-line:variable-name
  constructor(private http: HttpClient,private _chainService: ChainService, private _store: StoreService) { }

  ngOnInit() {
    this.interval = 10;
    // this.http.get('https://api1.binance.com/api/v3/ticker/bookTicker').toPromise().then(res => console.log(res));
    setInterval(() => {
      this.timer++;
      this.chains.forEach(el => el.age++);
    }, 997);
    // this.reload();
    this.reloadInterval();
    this._store.getChains();
    this.subscription = this._store.chains.subscribe(res => {
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
    this.subscribed = [];
    const pinnedSubscriptions = [];
    // @ts-ignore
    if (!this.chains.length && data.length && document.getElementById('aud').play) document.getElementById('aud').play();
    this.chains = data.sort((a, b) => a.length - b.length).map((chainData, i) => {
      const [dollarRate, profit, isSubs] = chainData.splice(chainData.length - 3, 3);
      const generatedId = this._chainService.generateId(chainData);
      const tableRowObject = {
        gain: this._chainService.calcChainProfit(chainData, profit),
        chain: {chainData, dollarRate},
        score: `${profit.toFixed(2)} %`,
        age: this.chains.length ?
          this._chainService.getAgeOfChain(generatedId, this.chains) : 0,
        options: ' ',
        links: null,
        id: generatedId,
        isSubs,
        titles: this._chainService.getTitles(chainData)
      };
      if (isSubs) {
        pinnedSubscriptions.push(tableRowObject);
      }
      return tableRowObject;
    });
    this.chains = this.chains.filter((el, i) => pinnedSubscriptions.length ? !pinnedSubscriptions.some(sub => sub.id === el.id) : true);
    this.chains = [...pinnedSubscriptions, ...this.chains];
  }

  reload() {
    this._store.getChains();
    this.timer = 0;
  }

  refresh() {
    this._store._refresh = true;
    // this.reload();
    this._store.getChains();
  }

  updateInterval(interval = 0) {
    if (interval >= 0 || this.interval >= this.minInterval) { this.interval += interval; }
  }

  reloadInterval() {
    this.reload();
    setTimeout(() => {
      this.reloadInterval();
    }, this.interval);
  }

  pin(e): void {
    let chainSubscriptions;
    this.subscribedIds = this.subscribed.map(chainRow => this._chainService.generateId(chainRow.chain.chainData));
    if (this.subscribed.length > 1) {
      chainSubscriptions = this.subscribed.reduce((acc, el, i) => {
        const elArr = el.chain.chainData;
        if (i === 1) { return acc.chain.chainData.reduce(this.subsChainReducer) + elArr.reduce(this.subsChainReducer); }
        return acc + elArr.reduce(this.subsChainReducer);
      });
    } else { chainSubscriptions = this.subscribed[0].chain.chainData.reduce(this.subsChainReducer); }
    chainSubscriptions = chainSubscriptions.substring(0, chainSubscriptions.length - 1);
    this._store._urlParams = { chainSubscriptions: chainSubscriptions };
  }

  private subsChainReducer(rateAcc, rate, j, arr) {
    const ending = j < (arr.length - 1) ? ';' : 'n';
    if (j === 1) { return `${rateAcc.from},${rateAcc.to},${rateAcc.changer};${rate.from},${rate.to},${rate.changer + ending}`; }
    return rateAcc + `${rate.from},${rate.to},${rate.changer + ending}`;
  }

  openAllLinks(idx: number) {
    this._chainService.buildAllLinks(this.chains[idx].chain.chainData);
  }

  selectChain(chainRow) {
    console.log(chainRow);
    this._store.chainForSettings.next(chainRow);
  }

  toggleLoad() {
    console.log(this._store._isActiveR)
    this.toggleLoader = !this.toggleLoader;
    this._store._isActiveR = this.toggleLoader;
    
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
